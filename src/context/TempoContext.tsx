import React, {useEffect, useState, createContext} from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from "firebase/database";
import { TempoData } from '../helpers/types';

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "organic-poetry-135723.firebaseapp.com",
    databaseURL: "https://organic-poetry-135723.firebaseio.com",
    projectId: "organic-poetry-135723",
    storageBucket: "organic-poetry-135723.appspot.com",
    messagingSenderId: "319975246753",
    appId: "1:319975246753:web:8e33bb82e85c1683a0d9e0",
    measurementId: "G-35FD8Q66YK"
};

initializeApp(firebaseConfig);
const db = getDatabase();

type Props = {
  children: React.ReactNode;
}

interface Dictionary<T> {
    [Key: string]: T;
}

interface TempoContext {
    allTempos: Dictionary<TempoData>;
    loading: boolean,
    selectedTempo: number | null,
    setSelectedTempo: any
}

const defaultValue: TempoContext = {
    allTempos: {},
    loading: true,
    selectedTempo: null,
    setSelectedTempo: () => { }
}

export const TempoContext = createContext(defaultValue);

export const TempoContextProvider = (props: Props) => {
    const [allTempos, setAllTempos] = useState<Dictionary<TempoData>>({});
    const [loading, setLoading] = useState(true);
    const [selectedTempo, setSelectedTempo] = useState(null);
    
    useEffect(() => {
        const tempoRef = ref(db, 'tempo');
        onValue(tempoRef, (snapshot) => {
            const data = snapshot.val();
            setAllTempos(data);
            setLoading(false);
        });
    },[]);
    
    return (
        <TempoContext.Provider
            value={{
                allTempos,
                loading,
                selectedTempo,
                setSelectedTempo
            }}
        >
            {props.children}
        </TempoContext.Provider>
    
    );
};