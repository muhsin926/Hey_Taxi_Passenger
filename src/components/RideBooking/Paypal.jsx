import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { LocationContext } from "../../context/LocationContext";
import { setPayment } from "../../redux/slices/ModalSlice";
import url from "../../api/Api";
import { io } from "socket.io-client";

const Paypal = ({ fare }) => {
  const { userId } = useSelector((state) => state.auth);
  const { scheduleDate, scheduleTime } = useSelector((state) => state.scheduleRide)
  const { categoryId } = useSelector((state) => state.modal);
  const { startPoint, endPoint } = useSelector((state) => state.locationSlice);
  const { startingCoordinates, destinationCoordinates, socket, setSocket } =
    useContext(LocationContext);
  const [orderId, setOrderId] = useState();
  const { distance } = useContext(LocationContext);
  const dispatch = useDispatch();
  const setFare = fare * distance;


  useEffect(() => {
    const data = io(import.meta.env.VITE_SERVER_DOMAIN)
    setSocket(data)
    socket && socket.emit("addUser", userId);
  }, [])

  const sendRequest = async () => {
    socket.emit("send_request", {
     _id: userId,
     pickupLocation: startPoint,
     destination: endPoint,
     sender:{name: 'Fayis'}
    });

    const token = localStorage.getItem("token");
   const {data} = await axios.post(
      `${url}/api/passenger/ride-request`,
      {
        userId,
        pickup: startPoint,
        dropOff: endPoint,
        latitude: startingCoordinates,
        longitude: destinationCoordinates,
        fare: setFare,
        paymentId: orderId,
        scheduleDate,
        scheduleTime,
        categoryId,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    debugger
    dispatch(setPayment());
  };

  const createOrder = async (data, actions) => {
    return await actions.order
      .create({
        purchase_units: [
          {
            description: "Taxi booking",
            amount: {
              currency_code: "USD",
              value: `${fare * distance}`,
            },
          },
        ],
        application_context: {
          shipping_preference: "NO_SHIPPING",
        },
      })
      .then((orderID) => {
        setOrderId(orderID);
        return orderID;
      });
  };

  const onApprove = async (data, actions) => {
    return await actions.order.capture().then((details) => {
      const { payer } = details;
      sendRequest();
      toast.success(`Transaction completed by ${payer.name.given_name}`);
    });
  };

  const onError = (data, actions) => {
    toast.error("An error occured with your payment");
  };

  return (
    <>
      <PayPalScriptProvider
        options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID }}
      >
        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
        />
      </PayPalScriptProvider>
      <Toaster />
    </>
  );
};

export default Paypal;
