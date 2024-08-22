import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Stepper from '../components/Stepper';
import treatmentsData from '../data/treatments.json';
import './Presentation.css';  // Import CSS for styling

const Presentation = () => {
    const [selectedTreatment, setSelectedTreatment] = useState("Tooth Extraction");

    return (
        <div className="presentation">
            <Sidebar
                treatments={Object.keys(treatmentsData)}
                onSelect={setSelectedTreatment}
            />
            <div className="content">
                <Stepper steps={treatmentsData[selectedTreatment]} />
            </div>
        </div>
    );
};

export default Presentation;
