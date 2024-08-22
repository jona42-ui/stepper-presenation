import React from 'react';
import './Sidebar.css';  // Import CSS for styling

const Sidebar = ({ treatments, onSelect }) => {
    return (
        <div className="sidebar">
            <h2>Treatments</h2>
            <ul>
                {treatments.map((treatment) => (
                    <li key={treatment} onClick={() => onSelect(treatment)}>
                        {treatment}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
