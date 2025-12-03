import { Sun, Moon} from "lucide-react";
import { useState } from "react";

export const ThemeToggle = () => {
    const [isDarkMode, setisDarkMode] = useState(false);

    const toggleTheme = () => {
        if(isDarkMode) {
            document.documentElement.classList.remove("dark");
            setisDarkMode(false);
        } else {
            document.documentElement.classList.add("dark");
            setisDarkMode(true);
        }
    }

    return (
        <>
            <button onClick={toggleTheme}>
                {isDarkMode ? <Sun className="h-6 w-6 text-yellow-300"/> : <Moon/>}
            </button>
        </>
    )
}