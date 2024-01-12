import * as csurf from 'csurf';

declare module 'express-serve-static-core' {
  interface Request {
    csrfToken(): string;
  }
}
