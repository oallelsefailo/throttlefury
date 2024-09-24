import React, { useEffect, useRef, useCallback } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "./firebaseConfig";

function PayPalButton({ contributionAmount, itemId }) {
  const paypalContainerRef = useRef(null);
  const initialized = useRef(false);

  const renderPayPalButtons = useCallback(() => {
    if (!window.paypal || !paypalContainerRef.current) {
      return; // Prevent rendering if PayPal SDK isn't loaded or container is not available
    }

    // Clear previous buttons if they exist
    paypalContainerRef.current.innerHTML = "";

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
                  value: validAmount.toFixed(2),
                },
              },
            ],
          });
        },
        onApprove: async function (data, actions) {
          return actions.order.capture().then(async function (details) {
            const validAmount = parseFloat(contributionAmount);
            const itemRef = doc(db, "items", itemId);
            await updateDoc(itemRef, {
              current: increment(validAmount),
            });
          });
        },
      })
      .render(paypalContainerRef.current)
      .catch((error) => {
        console.error("Error rendering PayPal buttons:", error);
      });
  }, [contributionAmount, itemId]);

  useEffect(() => {
    const loadPayPalScript = () => {
      const script = document.createElement("script");
      script.src =
        "https://www.paypal.com/sdk/js?client-id=AQD9MrjSwon4T7-ywRak88FPWofkAu0quLZoM3SjKXqMqp91GMbeJOYOkv8kzb0PbyAe8iJClyeXJOjV&enable-funding=venmo&disable-funding=credit,card,paylater";
      script.onload = () => {
        initialized.current = true; // Mark as initialized
        renderPayPalButtons(); // Render buttons after SDK loads
      };
      script.onerror = () => console.error("Error loading PayPal SDK script.");
      document.body.appendChild(script);
    };

    if (!initialized.current) {
      loadPayPalScript();
    }

    return () => {
      // Cleanup function to avoid memory leaks
      if (paypalContainerRef.current) {
        paypalContainerRef.current.innerHTML = ""; // Clear PayPal buttons
      }
    };
  }, [renderPayPalButtons]); // Add renderPayPalButtons to the dependencies

  useEffect(() => {
    if (initialized.current && contributionAmount > 0) {
      renderPayPalButtons(); // Render buttons only if contributionAmount is valid
    }
  }, [contributionAmount, renderPayPalButtons]); // Include renderPayPalButtons here as well

  return <div ref={paypalContainerRef} id="paypal-button-container"></div>;
}

export default PayPalButton;
