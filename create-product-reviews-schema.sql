-- Product Reviews & Ratings System Database Schema
-- Run this in your Supabase SQL Editor

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title VARCHAR(255),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a user can only review a product once
    CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id)
);

-- Create review_helpfulness table for tracking helpful votes
CREATE TABLE IF NOT EXISTS public.review_helpfulness (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a user can only vote once per review
    CONSTRAINT unique_user_review_vote UNIQUE (user_id, review_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON public.product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON public.product_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_product_reviews_approved ON public.product_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_review_id ON public.review_helpfulness(review_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_product_reviews_updated_at 
    BEFORE UPDATE ON public.product_reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpfulness ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_reviews

-- Users can view approved reviews
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews
    FOR SELECT USING (is_approved = true);

-- Users can view their own reviews (even if not approved)
CREATE POLICY "Users can view their own reviews" ON public.product_reviews
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews" ON public.product_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Users can create their own reviews
CREATE POLICY "Users can create reviews" ON public.product_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" ON public.product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can update any review (for moderation)
CREATE POLICY "Admins can update any review" ON public.product_reviews
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" ON public.product_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can delete any review
CREATE POLICY "Admins can delete any review" ON public.product_reviews
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for review_helpfulness

-- Users can view all helpfulness votes
CREATE POLICY "Anyone can view helpfulness votes" ON public.review_helpfulness
    FOR SELECT USING (true);

-- Users can create helpfulness votes
CREATE POLICY "Users can vote on helpfulness" ON public.review_helpfulness
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update their own votes" ON public.review_helpfulness
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete their own votes" ON public.review_helpfulness
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update helpful_count when helpfulness votes change
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update helpful count when new vote is added
        UPDATE public.product_reviews 
        SET helpful_count = (
            SELECT COUNT(*) 
            FROM public.review_helpfulness 
            WHERE review_id = NEW.review_id AND is_helpful = true
        )
        WHERE id = NEW.review_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update helpful count when vote is changed
        UPDATE public.product_reviews 
        SET helpful_count = (
            SELECT COUNT(*) 
            FROM public.review_helpfulness 
            WHERE review_id = NEW.review_id AND is_helpful = true
        )
        WHERE id = NEW.review_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update helpful count when vote is deleted
        UPDATE public.product_reviews 
        SET helpful_count = (
            SELECT COUNT(*) 
            FROM public.review_helpfulness 
            WHERE review_id = OLD.review_id AND is_helpful = true
        )
        WHERE id = OLD.review_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for helpful count updates
CREATE TRIGGER update_helpful_count_on_insert
    AFTER INSERT ON public.review_helpfulness
    FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

CREATE TRIGGER update_helpful_count_on_update
    AFTER UPDATE ON public.review_helpfulness
    FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

CREATE TRIGGER update_helpful_count_on_delete
    AFTER DELETE ON public.review_helpfulness
    FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Create function to check if user has purchased the product
CREATE OR REPLACE FUNCTION check_verified_purchase(user_id_param UUID, product_id_param BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.orders o
        JOIN public.order_items oi ON o.id = oi.order_id
        WHERE o.user_id = user_id_param 
        AND oi.product_id = product_id_param
        AND o.status IN ('delivered', 'completed')
    );
END;
$$ language 'plpgsql';

-- Create function to get product rating statistics
CREATE OR REPLACE FUNCTION get_product_rating_stats(product_id_param BIGINT)
RETURNS TABLE(
    average_rating DECIMAL(3,2),
    total_reviews INTEGER,
    rating_distribution JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(AVG(rating::DECIMAL), 0)::DECIMAL(3,2) as average_rating,
        COUNT(*)::INTEGER as total_reviews,
        JSON_BUILD_OBJECT(
            '5', COUNT(CASE WHEN rating = 5 THEN 1 END),
            '4', COUNT(CASE WHEN rating = 4 THEN 1 END),
            '3', COUNT(CASE WHEN rating = 3 THEN 1 END),
            '2', COUNT(CASE WHEN rating = 2 THEN 1 END),
            '1', COUNT(CASE WHEN rating = 1 THEN 1 END)
        ) as rating_distribution
    FROM public.product_reviews 
    WHERE product_id = product_id_param AND is_approved = true;
END;
$$ language 'plpgsql';

-- Insert sample reviews for testing (optional)
-- Uncomment and modify these if you want sample data
/*
INSERT INTO public.product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase) VALUES
(1, (SELECT id FROM auth.users LIMIT 1), 5, 'Excellent product!', 'This brake pad set exceeded my expectations. Great quality and perfect fit.', true),
(1, (SELECT id FROM auth.users OFFSET 1 LIMIT 1), 4, 'Good value', 'Solid product for the price. Installation was straightforward.', true),
(2, (SELECT id FROM auth.users LIMIT 1), 5, 'Perfect oil filter', 'High quality filter, fits perfectly and arrived quickly.', true);
*/

-- Verify the schema was created correctly
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('product_reviews', 'review_helpfulness')
ORDER BY table_name, ordinal_position;
