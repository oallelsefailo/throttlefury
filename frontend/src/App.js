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
  const [contributions, setContributions] = useState([]);

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
                    {contributions[item.id] > 4 && (
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

      <p className="min-amount-message">
        Due to PayPal's fees, the minimum amount is{" "}
        <span style={{ color: "red", fontSize: "17px" }}>$5.00</span>
        .
        <br />
        However, if you'd like to send less or get around their fees, you may
        Venmo me directly
        <a
          href="https://account.venmo.com/u/throttlefury"
          target="_blank"
          rel="noreferrer"
          style={{
            color: "blue",
            textDecoration: "underline",
            marginLeft: "5px",
            fontSize: "20px",
          }}
        >
          here
        </a>
        .
        <br />
        <p className="thank-you-message">
          <span>T</span>
          <span>H</span>
          <span>A</span>
          <span>N</span>
          <span>K</span>
          <span> </span>
          <span>Y</span>
          <span>O</span>
          <span>U</span>
          <span>!</span>
        </p>
      </p>

      {/* Photo Gallery Section */}
      <div className="photo-gallery">
        <h2>Crash Pictures</h2>
        <div className="gallery-container">
          <img src="/images/image1.jpg" alt="Rear seat/frame" />
          <img src="/images/image2.jpg" alt="exhaust and pegs" />
          <img src="/images/image3.jpg" alt="main damage on fairings" />
          <img src="/images/image4.jpg" alt="bent wheel" />
          <img src="/images/image5.jpg" alt="gas tank" />
          <img src="/images/image6.jpg" alt="helmet damage" />
        </div>
      </div>

      <div className="photo-gallery dress-gallery">
        <h2>Win This Handmade Dress!</h2>
        <p>
          If you contribute $20 or more, you'll be automatically entered into a
          raffle to win a custom-made crocheted dress tailored to your
          measurements.
          <br /> {/* Corrected br tag */}
          <small style={{ fontSize: "14px" }}>
            Note: The raffle will be held if total contributions reach $1,500,
            regardless of the overall $5,000 goal. Each person is limited to one
            entry. Please ensure a valid email address or Instagram handle is
            provided for contact.
          </small>
          <br />
          Dress made by:{" "}
          <a
            href="https://www.instagram.com/knottyoddie/"
            target="_blank"
            rel="noreferrer"
          >
            <span
              style={{ color: "red", fontWeight: "bold", fontSize: "18px" }}
            >
              @knottyoddie
            </span>
          </a>
        </p>

        <div className="dress-gallery-container">
          <img src="/images/dress1.jpg" alt="Dress 1" />
          <img src="/images/dress2.jpg" alt="Dress 2" />
          <img src="/images/dress3.jpg" alt="Dress 3" />
        </div>
      </div>
    </div>
  );
}

export default App;
