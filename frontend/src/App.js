import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faTiktok,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";
import PayPalButton from "./PayPalButton";

function App() {
  const [items, setItems] = useState([]);
  const [contributions, setContributions] = useState({});

  // Fetch items from Firestore
  useEffect(() => {
    const itemsCollection = collection(db, "items");
    const unsubscribe = onSnapshot(itemsCollection, (snapshot) => {
      const itemsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsData);
    });

    return () => unsubscribe();
  }, []);

  // Handle Input Change (whole numbers only) and set contribution amount
  const handleContributionChange = (itemId, value) => {
    // Remove any non-digit characters
    const sanitizedValue = value.replace(/[^0-9]/g, "");
    const amount = sanitizedValue === "" ? 0 : parseFloat(sanitizedValue);
    setContributions((prev) => ({
      ...prev,
      [itemId]: amount,
    }));
  };

  return (
    <div>
      <header className="main-header">
        <div className="logo">
          <h1>ThrottleFury</h1>
        </div>
        <div className="social-icons">
          <a
            href="https://tiktok.com/@thethrottlefury"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faTiktok} size="2x" />
          </a>
          <a
            href="https://instagram.com/throttlefury"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faInstagram} size="2x" />
          </a>
          <a
            href="https://discord.com/invite/sjht4WwCKw"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faDiscord} size="2x" />
          </a>
        </div>
      </header>

      <section className="contribution-section">
        {items.length > 0 ? (
          items.map((item) => {
            const remainingBalance = item.goal - item.current;

            return (
              <div className="item" key={item.id}>
                <img
                  src={`/images/${item.id}-icon.jpg`}
                  alt={item.displayName}
                />
                <div className="details">
                  <h2>
                    {item.displayName} - ${item.goal}
                  </h2>
                  <p>Remaining balance: ${remainingBalance}</p>
                  <div
                    className="progress-bar-container"
                    style={{ width: "70%" }}
                  >
                    <div
                      className="progress-bar"
                      style={{ width: `${(item.current / item.goal) * 100}%` }}
                    >
                      <span className="progress-text">
                        {`${Math.round((item.current / item.goal) * 100)}%`}
                      </span>
                    </div>
                  </div>

                  {/* Input field */}
                  <div className="input-and-buttons">
                    <div className="input-wrapper">
                      <span className="input-prefix">$</span>
                      <input
                        type="text"
                        className="contribution-input"
                        value={
                          contributions[item.id] === 0
                            ? ""
                            : contributions[item.id]
                        }
                        onChange={(e) =>
                          handleContributionChange(item.id, e.target.value)
                        }
                        placeholder="Enter amount"
                      />
                    </div>

                    {/* PayPal button */}
                    {contributions[item.id] > 0 && (
                      <PayPalButton
                        contributionAmount={contributions[item.id]}
                        itemId={item.id}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p>Loading data or no items found...</p>
        )}
      </section>
    </div>
  );
}

export default App;
