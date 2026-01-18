import { auth0 } from "@/lib/auth0";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";
import Profile from "@/components/Profile";

export default async function Auth0DemoPage() {
    const session = await auth0.getSession();
    const user = session?.user;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-primary p-8 flex flex-col items-center animate-fade-in relative overflow-hidden">

                {/* Decorative background blur */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent" />

                <img
                    src="https://cdn.auth0.com/quantum-assets/dist/latest/logos/auth0/auth0-lockup-en-ondark.png"
                    alt="Auth0 Logo"
                    className="w-40 mb-8 opacity-90"
                />

                <h1 className="text-3xl font-bold mb-2 text-center font-heading text-foreground">
                    Welcome Back
                </h1>
                <p className="text-muted-foreground text-center mb-8">
                    Sign in to manage your lost & found reports
                </p>

                <div className="w-full flex flex-col gap-4">
                    {user ? (
                        <div className="flex flex-col items-center w-full gap-6">
                            <div className="bg-primary/10 text-primary-foreground px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                                ✅ Successfully logged in
                            </div>
                            <Profile />
                            <div className="w-full">
                                <LogoutButton />
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col gap-4">
                            <LoginButton />
                            <p className="text-xs text-center text-muted-foreground mt-4">
                                By continuing, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
