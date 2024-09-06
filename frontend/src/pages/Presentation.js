import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Stepper from '../components/Stepper';
import treatmentsData from '../data/treatments.json';
import './Presentation.css'; 

const Presentation = () => {
    // Set the initial state to the first treatment in the data
    const initialTreatment = Object.keys(treatmentsData)[0];
    const [selectedTreatment, setSelectedTreatment] = useState(initialTreatment);

    return (
        <div className="presentation">
            {/* Sidebar for selecting treatments */}
            <Sidebar
                treatments={Object.keys(treatmentsData)}
                onSelect={setSelectedTreatment}
            />
            
            {/* Main content area displaying the stepper for the selected treatment */}
            <div className="content">
    <Stepper steps={treatmentsData[selectedTreatment]} selectedTreatment={selectedTreatment} />
</div>

        </div>
    );
};

export default Presentation;
