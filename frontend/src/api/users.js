// Get all users
export const getUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const clonedResponse = response.clone();
      let errorMessage;
      try {
        const errorBody = await clonedResponse.json();
        errorMessage = errorBody.message || `HTTP error! Status: ${response.status}`;
      } catch (e) {
        errorMessage = (await response.text()) || `HTTP error! Status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to fetch users');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get a single user by ID
export const getUserById = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/users?id=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const clonedResponse = response.clone();
      let errorMessage;
      try {
        const errorBody = await clonedResponse.json();
        errorMessage = errorBody.message || `HTTP error! Status: ${response.status}`;
      } catch (e) {
        errorMessage = (await response.text()) || `HTTP error! Status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to fetch user');
    }
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const clonedResponse = response.clone();
      let errorMessage;
      try {
        const errorBody = await clonedResponse.json();
        errorMessage = errorBody.message || `HTTP error! Status: ${response.status}`;
      } catch (e) {
        errorMessage = (await response.text()) || `HTTP error! Status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to create user');
    }
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update an existing user
export const updateUser = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/users`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const clonedResponse = response.clone();
      let errorMessage;
      try {
        const errorBody = await clonedResponse.json();
        errorMessage = errorBody.message || `HTTP error! Status: ${response.status}`;
      } catch (e) {
        errorMessage = (await response.text()) || `HTTP error! Status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to update user');
    }
  } catch (error) {
    console.error(`Error updating user with ID ${userData.id}:`, error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/admin/users?id=${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const clonedResponse = response.clone();
      let errorMessage;
      try {
        const errorBody = await clonedResponse.json();
        errorMessage = errorBody.message || `HTTP error! Status: ${response.status}`;
      } catch (e) {
        errorMessage = (await response.text()) || `HTTP error! Status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (result.success) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to delete user');
    }
  } catch (error) {
    console.error(`Error deleting user with ID ${userId}:`, error);
    throw error;
  }
};
