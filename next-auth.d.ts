import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
    avatarImg?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
      role?: string;
      avatarImg?: string;
    } & Session['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    avatarImg?: string;
  }
}
