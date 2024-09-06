import React, { useEffect, useRef, useCallback } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "./firebaseConfig";

function PayPalButton({ contributionAmount, itemId }) {
  const paypalContainerRef = useRef(null);
  const initialized = useRef(false); // Track if buttons are already rendered

  // Memoize the renderPayPalButtons function
  const renderPayPalButtons = useCallback(() => {
    if (!window.paypal) {
      console.error("PayPal SDK not loaded.");
      return;
    }

    // Clear previous buttons if they exist
    if (paypalContainerRef.current) {
      paypalContainerRef.current.innerHTML = "";
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
            const validAmount = parseFloat(contributionAmount);
            const itemRef = doc(db, "items", itemId);
            await updateDoc(itemRef, {
              current: increment(validAmount),
            });
          });
        },
      })
      .render(paypalContainerRef.current);
  }, [contributionAmount, itemId]);

  useEffect(() => {
    const loadPayPalScript = () => {
      const script = document.createElement("script");
      script.src =
        "https://www.paypal.com/sdk/js?client-id=AQD9MrjSwon4T7-ywRak88FPWofkAu0quLZoM3SjKXqMqp91GMbeJOYOkv8kzb0PbyAe8iJClyeXJOjV&enable-funding=venmo&disable-funding=credit,card,paylater";
      script.onload = () => {
        if (window.paypal) {
          renderPayPalButtons();
        } else {
          console.error("PayPal SDK failed to load.");
        }
      };
      script.onerror = () => console.error("Error loading PayPal SDK script.");
      document.body.appendChild(script);

      // Cleanup the script when the component is unmounted
      return () => {
        document.body.removeChild(script);
      };
    };

    if (!initialized.current) {
      loadPayPalScript();
      initialized.current = true;
    } else {
      renderPayPalButtons(); // Ensure the buttons are rendered if already initialized
    }
  }, [renderPayPalButtons]); // Add renderPayPalButtons to the dependency array

  return <div ref={paypalContainerRef} id="paypal-button-container"></div>;
}

export default PayPalButton;
