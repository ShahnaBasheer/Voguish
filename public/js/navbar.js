document.addEventListener('DOMContentLoaded', async function () {
  const selectGender = document.getElementById('selectGender');
  const searchInput = document.getElementById('searchInput');
  const searchDropdown = document.getElementById('searchDropdown');
  const forgotPassword = document.getElementById('forgotPassword');
 

    async function fetchAndDisplaySuggestions() {
        try {
          const response = await fetch(`/select?gender=${selectGender?.value}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          if (response.ok) {
            const data = await response.json();
            const predefinedSuggestions = data?.categories;
            displaySuggestions(predefinedSuggestions);
          }
        } catch (error) {
          console.error('An unexpected error occurred:', error);
          // Handle unexpected errors - update UI or show an error message
        }
    }
  
    function displaySuggestions(suggestions) {
        if(!searchDropdown) return false;
        searchDropdown.innerHTML = '';
    
        suggestions?.forEach(function (suggestion) {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<a class="dropdown-item" href="/search?gender=${selectGender?.value}&searchVal=${suggestion}">${suggestion}</a>`;
          searchDropdown.appendChild(listItem);
    
          // Prevent the default behavior of the anchor element
          listItem?.addEventListener('mousedown', function (e) {
            e.preventDefault();
            window.location.href = listItem.querySelector('a').getAttribute('href');
          });
        });
    }
  
    // Fetch and display suggestions when the page loads
    await fetchAndDisplaySuggestions();
  
    selectGender?.addEventListener('change', async function (event) {
        if(['women','men','girls', 'boys'].includes(selectGender.value)){
          await fetchAndDisplaySuggestions();
        }
    });
  
    searchInput?.addEventListener('input', function () {
      const inputValue = searchInput.value.toLowerCase();
      // You can add additional logic here if needed
    });
  
    // Show the suggestion box when the search input or dropdown is focused
    const showDropdown = function () {
        searchDropdown.style.display = 'block';
    };
  
    searchInput?.addEventListener('focus', showDropdown);
    searchDropdown?.addEventListener('focus', showDropdown);
  
    // Hide the suggestion box when the search input or dropdown loses focus
    const hideDropdown = function () {
      searchDropdown.style.display = 'none';
    };
  
    searchInput?.addEventListener('blur', hideDropdown);
    searchDropdown?.addEventListener('blur', hideDropdown);


    forgotPassword?.addEventListener('click', async function() {
        Swal.fire({
            title: "Reset Password",
            text: "Enter your email address and we will send you a link to reset your password.",
            input: "text",
            inputAttributes: {
              autocapitalize: "off",
              placeholder: "enter email.."
            },
            showCancelButton: true,
            confirmButtonText: "Send",
            showLoaderOnConfirm: true,
            preConfirm: async (email) => { // Use the provided parameter for email
              try {
                const url = `/forgotPassword`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json', // Specify content type as JSON
                    },
                    body: JSON.stringify({ email }), // Send email in the request body
                });
    
                if (!response.ok) {
                  return Swal.showValidationMessage(`
                    ${JSON.stringify(await response.json())}
                  `);
                }
    
                return response.json();
              } catch (error) {
                Swal.showValidationMessage(`
                  Request failed: ${error.message}
                `);
              }
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: result.email,
                text: `email sent successfully!${result.email}`,
                showCancelButton: false,
                icon: "Success",
                timer: 1500,
              });
            }
        });
    });

});
