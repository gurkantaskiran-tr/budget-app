
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Kullanıcı Adı", type: "text", placeholder: "admin" },
                password: { label: "Şifre", type: "password" }
            },
            async authorize(credentials, req) {
                // Hardcoded user for simplicity as requested
                const user = { id: "1", name: "Admin", email: "admin@thinkone.com" }

                if (credentials?.username === "admin" && credentials?.password === "admin123") {
                    return user
                } else {
                    return null
                }
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                // session.user.id = token.id as string // Typescript might complain here, let's keep it simple
            }
            return session
        }
    }
})

export { handler as GET, handler as POST }
