import jwt from "jsonwebtoken";

export const generateAccessToken = (username: Record<string, string>) => {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

export const authenticateToken = (req): number => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return 401
    jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any, user: any) => {
      return 403;
    })
    return 200
  }