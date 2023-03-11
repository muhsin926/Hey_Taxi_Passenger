import React, { useContext, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { HomePage, LoginPage, RideBookingPage, SignupPage } from "./pages";
import RideSchedulePage from "./pages/RideSchedulePage";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import ProfilePage from "./pages/ProfilePage";
import RideHistoryPage from "./pages/RideHistoryPage";
import InboxPage from "./pages/InboxPage";
import ScheduledRidePage from "./pages/ScheduledRidePage";
import { LocationContext } from "./context/LocationContext";


function App() {
  const { userId } = useSelector((state) => state.auth)
  const { socket , setSocket } = useContext(LocationContext)
  useEffect(() => {
    const data = io(import.meta.env.VITE_SERVER_DOMAIN)
    setSocket(data)
    socket && socket.emit("addUser", userId);
  }, [])
  return (
    <div>
      <Routes>
        <Route path="/" exact={true} element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/ride" element={<RideBookingPage />} />
        <Route path="/schedule_ride" element={<RideSchedulePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/scheduled-rides" element={<ScheduledRidePage />} />
        <Route path="/ride-history" element={<RideHistoryPage />} />
        <Route path="/inbox" element={<InboxPage />} />
      </Routes>
    </div>
  );
}

export default App;
