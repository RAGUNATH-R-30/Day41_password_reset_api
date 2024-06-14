# Password Reset API

This API provides endpoints for handling password reset functionality, including generating reset tokens, validating tokens, and resetting passwords.

## Features

- **Token Generation**: Generates unique tokens for password reset requests.
- **Token Validation**: Validates the token sent by the user for password reset.
- **Password Reset**: Allows users to reset their passwords after validating the token.
- **Security**: Ensures secure handling of reset tokens and passwords.
- **Logging and Error Handling**: Logs actions and handles errors gracefully.

## Technologies Used

- **Node.js**: A JavaScript runtime for server-side development.
- **Express.js**: A web application framework for Node.js to build APIs.
- **BCrypt**: For hashing passwords securely.
