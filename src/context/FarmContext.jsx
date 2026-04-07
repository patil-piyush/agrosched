import React, { createContext, useContext, useState } from 'react';
import { sampleFarm } from '../data/sampleFarm';

const FarmContext = createContext(null);

export function FarmProvider({ children }) {
  const [farm, setFarm] = useState(sampleFarm);
  const [seasonPlan, setSeasonPlan] = useState(null);
  const [algoResults, setAlgoResults] = useState({});

  const storeResult = (key, result) => {
    setAlgoResults(prev => ({ ...prev, [key]: result }));
  };

  return (
    <FarmContext.Provider value={{ farm, setFarm, seasonPlan, setSeasonPlan, algoResults, storeResult }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error('useFarm must be used inside FarmProvider');
  return ctx;
}
