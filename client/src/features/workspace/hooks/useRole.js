import { useState, useEffect } from 'react';

export const useRole = (user) => {
    const [role, setRole] = useState('student');

    useEffect(() => {
        if (user && user.role) {
            setRole(user.role);
            localStorage.setItem('user_role', user.role);
        } else {
            const stored = localStorage.getItem('user_role');
            if (stored) setRole(stored);
        }
    }, [user]);

    const isAdmin = role === 'admin';
    const isFaculty = role === 'faculty';
    const isStudent = role === 'student';

    return { role, isAdmin, isFaculty, isStudent, setRole };
};
