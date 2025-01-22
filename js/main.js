async function getData() {
    const accessToken = localStorage.getItem("accessToken");

    const res = await fetch("http://localhost:1313/users/", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const data = await res.json();
    console.log(data);
}
getData();

async function login() {
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;

    try {
        const res = await fetch("http://localhost:1313/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        if (!res.ok) {
            throw new Error("Login failed");
        }

        const data = await res.json();
        console.log(data);
        localStorage.setItem("accessToken", data.accessToken);
    } catch (error) {
        console.error("Error during login:", error);
        alert("Login failed. Please check your credentials.");
    }
}

async function register() {
    const email = document.querySelector("#email").value;
    const username = document.querySelector("#registerUsername").value;
    const password = document.querySelector("#registerPassword").value;

    try {
        const res = await fetch("http://localhost:1313/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                username,
                password,
            }),
        });

        if (!res.ok) {
            throw new Error("Registration failed");
        }

        const data = await res.json();
        console.log(data);
    } catch (error) {
        console.error("Error during registration:", error);
        alert("Registration failed. Please try again.");
    }
}

// Add event listeners to separate forms
document.querySelector("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    login();
});

document.querySelector("#registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    register();
});
