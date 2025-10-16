// src/modules/auth/apollo/auth.js
import * as ApolloClient from "@apollo/client";
const { gql } = ApolloClient;

export const LOGIN = gql`
  mutation login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        profile { 
          firstName 
          lastName 
        }
        roles {
          id
          name
          permissions {
            id
            code
            action
            resource
          }
        }
        picture
        emailConfirmed
      }
      accessToken
      refreshToken
    }
  }
`;

export const REGISTER = gql`
  mutation register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        email
        profile { 
          firstName 
          lastName 
        }
        roles {
          id
          name
          permissions {
            id
            code
            action
            resource
          }
        }
        picture
      }
      accessToken
      refreshToken
    }
  }
`;

export const CONFIRM_EMAIL = gql`
  mutation confirmEmail($token: String!) {
    confirmEmail(token: $token) {
      success
      message
      user {
        id
        email
        emailConfirmed
        profile { 
          firstName 
          lastName 
        }
      }
    }
  }
`;

export const RESEND_CONFIRMATION = gql`
  mutation resendConfirmation($email: String!, $confirmationUrl: String) {
    resendConfirmation(email: $email, confirmationUrl: $confirmationUrl) {
      success
      message
    }
  }
`;

export const VERIFY_EMAIL_CODE = gql`
  mutation verifyEmailCode($email: String!, $code: String!) {
    verifyEmailCode(email: $email, code: $code) {
      success
      message
      user {
        id
        email
        emailConfirmed
        profile { 
          firstName 
          lastName 
        }
      }
    }
  }
`;

export const RESEND_VERIFICATION_CODE = gql`
  mutation resendVerificationCode($email: String!) {
    resendVerificationCode(email: $email) {
      success
      message
    }
  }
`;

export const SOCIAL_LOGIN = gql`
  mutation socialLogin($input: SocialLoginInput!) {
    socialLogin(input: $input) {
      user {
        id
        email
        profile { 
          firstName 
          lastName 
        }
        roles {
          id
          name
          permissions {
            id
            code
            action
            resource
          }
        }
        picture
        social { 
          google { id } 
          facebook { id } 
        }
      }
      accessToken
      refreshToken
    }
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation forgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation resetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation changePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export const LOGOUT = gql`
  mutation logout($refreshToken: String) {
    logout(refreshToken: $refreshToken) {
      success
      message
    }
  }
`;

export const ME = gql`
  query me {
    me {
      id
      email
      profile {
        firstName
        lastName
      }
      roles {
        id
        name
        permissions {
          id
          code
          action
          resource
        }
      }
      picture
    }
  }
`;

export const VALIDATE_TOKEN = gql`
  query validateToken($token: String!) {
    validateToken(token: $token)
  }
`;
