import React, {useEffect, useState, createContext} from 'react';
import { TempoData } from '../helpers/types';
import database from '@react-native-firebase/database';

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
        database()
        .ref('tempo')
        .on('value', snapshot => {
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