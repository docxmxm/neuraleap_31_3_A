// Email display fix script
document.addEventListener('DOMContentLoaded', function() {
  console.log('Email fix script loaded');
  
  // Wait a moment to ensure all other scripts have run
  setTimeout(function() {
    // Focus only on the email field in the form
    const emailField = document.getElementById('email');
    console.log('Email field element found:', emailField ? 'yes' : 'no');
    
    // Check if the field is already populated with a valid-looking email
    if (emailField && emailField.value && emailField.value.includes('@')) {
      console.log('Email field already has a valid value:', emailField.value);
      return; // Don't override if it's already set properly
    }
    
    if (emailField && window.supabaseClient) {
      console.log('Attempting to get user email from Supabase');
      
      window.supabaseClient.auth.getUser()
        .then(({ data: { user } }) => {
          if (user && user.email) {
            // Store the original value for debugging
            const originalValue = emailField.value;
            
            // Update the field
            emailField.value = user.email;
            
            console.log('Email field updated from:', originalValue, 'to:', user.email);
          } else {
            console.warn('User or user email not found in Supabase response');
          }
        })
        .catch(err => {
          console.error('Error getting email from Supabase:', err);
        });
    } else {
      console.warn('Email field element or Supabase client not available');
    }
  }, 1000); // Wait 1 second
});
