import React, { useEffect, useRef } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "./firebaseConfig";

function PayPalButton({ contributionAmount, itemId }) {
  const paypalContainerRef = useRef(null);
  const initialized = useRef(false); // Track if buttons are already rendered

  useEffect(() => {
    const renderPayPalButtons = () => {
      if (paypalContainerRef.current) {
        paypalContainerRef.current.innerHTML = ""; // Clear any existing buttons
      }

      window.paypal
        .Buttons({
          createOrder: function (data, actions) {
            const validAmount = parseFloat(contributionAmount);

            if (isNaN(validAmount) || validAmount <= 0) {
              alert("Please enter a valid contribution greater than $0");
              return;
            }

            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: validAmount.toFixed(2), // Send the correct amount to PayPal
                  },
                },
              ],
            });
          },
          onApprove: async function (data, actions) {
            return actions.order.capture().then(async function (details) {

              // Update Firestore with the new contribution
              const validAmount = parseFloat(contributionAmount);
              const itemRef = doc(db, "items", itemId);
              await updateDoc(itemRef, {
                current: increment(validAmount),
              });
            });
          },
        })
        .render(paypalContainerRef.current);
    };

    if (!initialized.current) {
      const script = document.createElement("script");
      script.src =
        "https://www.paypal.com/sdk/js?client-id=AQD9MrjSwon4T7-ywRak88FPWofkAu0quLZoM3SjKXqMqp91GMbeJOYOkv8kzb0PbyAe8iJClyeXJOjV&enable-funding=venmo&disable-funding=credit,card,paylater";
      script.onload = renderPayPalButtons;
      document.body.appendChild(script);
      initialized.current = true; // Mark as initialized to avoid multiple renders
    } else {
      renderPayPalButtons(); // Ensure the buttons are rendered if already initialized
    }
  }, [contributionAmount, itemId]); // Add contributionAmount to the dependency array

  return <div ref={paypalContainerRef} id="paypal-button-container"></div>;
}

export default PayPalButton;
