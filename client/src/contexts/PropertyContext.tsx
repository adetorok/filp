import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { apiConfig } from '../config/api';

// Configure axios with base URL
axios.defaults.baseURL = apiConfig.baseURL;

interface Property {
  _id: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    fullAddress: string;
  };
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  purchasePrice: number;
  estimatedRepairCosts: number;
  estimatedARV: number;
  estimatedProfit: number;
  estimatedROI: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PropertyContextType {
  properties: Property[];
  loading: boolean;
  fetchProperties: () => Promise<void>;
  createProperty: (property: Omit<Property, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
};

interface PropertyProviderProps {
  children: ReactNode;
}

export const PropertyProvider: React.FC<PropertyProviderProps> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/properties');
      setProperties(res.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProperty = async (property: Omit<Property, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await axios.post('/api/properties', property);
      setProperties(prev => [res.data, ...prev]);
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  };

  const updateProperty = async (id: string, property: Partial<Property>) => {
    try {
      const res = await axios.put(`/api/properties/${id}`, property);
      setProperties(prev => prev.map(p => p._id === id ? res.data : p));
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      await axios.delete(`/api/properties/${id}`);
      setProperties(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const value = {
    properties,
    loading,
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};
