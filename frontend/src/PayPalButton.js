import React, { useEffect, useRef } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "./firebaseConfig";

function PayPalButton({ contributionAmount, itemId }) {
  const paypalContainerRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    const renderPayPalButtons = () => {
      if (
        !paypalContainerRef.current ||
        paypalContainerRef.current.children.length > 0
      ) {
        return; // Don't render if buttons already exist
      }

      window.paypal
        .Buttons({
          createOrder: function (data, actions) {
            // Validate and cap the contributionAmount to ensure it's within acceptable limits
            let validAmount = parseFloat(contributionAmount);

            // Ensure the amount is between 0.01 and 999999999999.99 (PayPal's upper limit)
            if (isNaN(validAmount) || validAmount <= 0) {
              alert("Please enter a valid contribution greater than $0");
              return;
            } else if (validAmount > 999999999999.99) {
              alert("Contribution amount exceeds the allowed maximum.");
              return;
            }

            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: validAmount.toFixed(2), // Always format to 2 decimal places
                  },
                },
              ],
            });
          },
          onApprove: async function (data, actions) {
            return actions.order.capture().then(async function (details) {
              alert(
                "Transaction completed by " + details.payer.name.given_name
              );

              // Re-parse the contribution amount inside the onApprove function
              let validAmount = parseFloat(contributionAmount);

              // Update Firestore with the new contribution
              const itemRef = doc(db, "items", itemId);
              await updateDoc(itemRef, {
                current: increment(validAmount),
              });
            });
          },
        })
        .render(paypalContainerRef.current);
    };

    if (initialized.current) return; // Prevent further initialization if already done

    if (window.paypal) {
      renderPayPalButtons();
    } else {
      const script = document.createElement("script");
      script.src =
        "https://www.paypal.com/sdk/js?client-id=AZPKPv-VC9wMwz40qc07qBIu8Fwuan-UqFDAlyDxOwHUrAu5JJfZz7PYWfr5F_ctZvoRCnT9jkxe2HED&enable-funding=venmo&disable-funding=credit,card,paylater";
      script.onload = renderPayPalButtons;
      document.body.appendChild(script);
    }

    initialized.current = true; // Mark as initialized after rendering buttons
  }, [contributionAmount, itemId]);

  return (
    <div
      ref={paypalContainerRef}
      id="paypal-button-container"
      className="paypal-buttons"
    ></div>
  );
}

export default PayPalButton;
