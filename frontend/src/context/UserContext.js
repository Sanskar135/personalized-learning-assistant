import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userScore, setUserScore] = useState(0); // user score is the level of user 1-7 

  return (
    <UserContext.Provider value={{ userScore, setUserScore }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 