import { ThemeToggle } from "../components/ThemeToggle"
import { Link } from 'react-router-dom'

export const Home = () => {
    return (
        <>
            <div className="min-h-screen bg-background text-forground overflow-x-hidden">
                <ThemeToggle />
                <div className="flex flex-col items-center justify-center mt-8">
                    <h1 className="text-2xl font-bold mb-4">Welcome to my web</h1>

                    <Link
                        to="/backend-test"
                        className="text-blue-500 hover:text-blue-700 underline text-lg transition-colors duration-200"
                    >
                        🚀 Click here to test the backend API
                    </Link>

                    <Link
                        to="/register"
                        className="text-green-500 hover:text-green-700 underline text-lg transition-colors duration-200 text-center"
                    >
                        📝 Click here to register new account
                    </Link>

                    <Link
                        to="/login"
                        className="text-purple-500 hover:text-purple-700 underline text-lg transition-colors duration-200 text-center"
                    >
                        🔐 Click here to login
                    </Link>
                    <Link
                        to="/menu-test"
                        className="text-red-500 hover:text-red-700 underline text-lg transition-colors duration-200 text-center"
                    >
                        🍔 Click here to test the menu API
                    </Link>

                    <p className="mt-4 text-gray-600">or use path /backend-test </p>
                </div>
            </div>
        </>
    )
}