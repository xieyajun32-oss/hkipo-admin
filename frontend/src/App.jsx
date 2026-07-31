import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { isLoggedIn } from './api/client'
import Layout from './layouts/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Persons from './pages/Persons'
import Funds from './pages/Funds'
import BankCards from './pages/BankCards'
import SimCards from './pages/SimCards'
import Brokers from './pages/Brokers'
import Ipos from './pages/Ipos'
import IpoDetail from './pages/IpoDetail'
import IpoTemplate from './pages/IpoTemplate'
import HongKongBrief from './pages/HongKongBrief'
import OneThingArticle from './pages/OneThingArticle'

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/articles/one-thing" element={<OneThingArticle />} />
      <Route path="/admin" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="persons" element={<Persons />} />
        <Route path="funds" element={<Funds />} />
        <Route path="bank-cards" element={<BankCards />} />
        <Route path="sim-cards" element={<SimCards />} />
        <Route path="brokers" element={<Brokers />} />
        <Route path="ipos" element={<Ipos />} />
        <Route path="hk-brief" element={<HongKongBrief />} />
        <Route path="ipo-template" element={<IpoTemplate />} />
        <Route path="ipos/:id" element={<IpoDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" />} />
    </Routes>
  )
}
