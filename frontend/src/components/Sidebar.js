import React from 'react';
import './Sidebar.css'; 
import { FaTooth, FaStethoscope, FaSyringe, FaPills, FaBandAid, FaHeartbeat, FaXRay, FaSmile, FaAllergies} from 'react-icons/fa'; 

const icons = {
    "Tooth Extraction": <FaTooth size={24} />,
    "Root Canal": <FaTooth size={24} />, 
    "Teeth Whitening": <FaSmile size={24} />, 
    "Dental Implants": <FaAllergies size={24} />, 
    "General Checkup": <FaStethoscope size={24} />,
    "Vaccination": <FaSyringe size={24} />,
    "Medication": <FaPills size={24} />,
    "First Aid": <FaBandAid size={24} />,
    "Cardiology": <FaHeartbeat size={24} />,
    "X-Ray": <FaXRay size={24} />,
};

const Sidebar = ({ treatments, onSelect }) => {
    return (
        <div className="sidebar">
            <h2>Select Treatment</h2>
            <ul>
                {treatments.map((treatment) => (
                    <li key={treatment} onClick={() => onSelect(treatment)} className="sidebar-item">
                        <span className="icon">{icons[treatment]}</span>
                        <span className="text">{treatment}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
