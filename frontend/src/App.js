import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faTiktok,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";

function App() {
  const [items, setItems] = useState([]);

  // Fetching data from Firestore
  useEffect(() => {
    const itemsCollection = collection(db, "items");
    const unsubscribe = onSnapshot(itemsCollection, (snapshot) => {
      const itemsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsData);
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  // Return JSX
  return (
    <div>
      {/* Header with ThrottleFury and Social Media Icons */}
      <header className="main-header">
        <div className="logo">
          <h1>ThrottleFury</h1>
        </div>
        <div className="social-icons">
          <a
            href="https://tiktok.tom/@thethrottlefury"
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

      {/* Contribution Section Below */}
      <section className="contribution-section">
        {items.length > 0 ? (
          items.map((item) => (
            <div className="item" key={item.id}>
              <img src={`/images/${item.id}-icon.jpg`} alt={item.displayName} />
              <div className="details">
                <h2>
                  {item.displayName} - ${item.goal}
                </h2>
                <div
                  className="progress-bar-container"
                  style={{ width: "70%" }}
                >
                  <div
                    className="progress-bar"
                    style={{ width: `${(item.current / item.goal) * 100}%` }}
                  ></div>
                </div>
                <button className="contribute-btn">Contribute</button>
              </div>
            </div>
          ))
        ) : (
          <p>Loading data or no items found...</p>
        )}
      </section>
    </div>
  );
}

export default App;
