import React, {useState} from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {Alert, Snackbar} from "@mui/material";

import { AuthorizedRoute, UnauthorizedRoute } from './components/AuthRouters';

import LoginPage from './components/LoginPage';
import GeneratorPage from './components/GeneratorPage';
import CouponsPage from './components/CouponsPage';


function App() {

    // Авторизован ли пользователь
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Открыто ли уведомление
    const [openAlert, setOpenAlert] = useState(false);
    // Тип уведомления
    const [alertType, setAlertType] = useState('info');
    // Текст уведомления
    const [alertMessage, setAlertMessage] = useState("");

    // Обработчик закрытия уведомления
    const onCloseAlertClick = () => {
        setOpenAlert(false);
    };

    return (
        <div>
            <BrowserRouter>
                <Routes>
                    {/*Страница авторизации*/}
                    <Route path="/login" element={
                        <UnauthorizedRoute isAuthorized={isAuthorized}>
                            <LoginPage
                                setIsAuthorized={setIsAuthorized}
                                setOpenAlert={setOpenAlert}
                                setAlertType={setAlertType}
                                setAlertMessage={setAlertMessage}
                            />
                        </UnauthorizedRoute>
                    }/>

                    {/*Страница генерации купона*/}
                    <Route path="/generator" element={
                        <AuthorizedRoute isAuthorized={isAuthorized}>
                            <GeneratorPage
                                setOpenAlert={setOpenAlert}
                                setAlertType={setAlertType}
                                setAlertMessage={setAlertMessage}
                            />
                        </AuthorizedRoute>
                    } />

                    {/*Страница сгенерированных купонов*/}
                    <Route path="/coupons" element={
                        <AuthorizedRoute isAuthorized={isAuthorized}>
                            <CouponsPage
                                setOpenAlert={setOpenAlert}
                                setAlertType={setAlertType}
                                setAlertMessage={setAlertMessage}
                            />
                        </AuthorizedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>

            {/*Компонент уведомления*/}
            <Snackbar
                open={openAlert}
                autoHideDuration={6000}
                onClose={onCloseAlertClick}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={onCloseAlertClick}
                    severity={alertType}
                >
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default App;
