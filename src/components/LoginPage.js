import React, { useState, useEffect } from 'react';
import { Grid, Paper, TextField, Button, Typography, InputLabel, Input,
    InputAdornment, IconButton, FormHelperText, FormControl } from '@mui/material'
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { PulseLoader } from "react-spinners";
import { useNavigate } from 'react-router-dom';

import { postRequestHandler } from "./Requests";


const LoginPage = ({ setIsAuthorized, setOpenAlert, setAlertType, setAlertMessage }) => {
    let navigate = useNavigate();

    // Поле логина пользователя
    const [login, setLogin] = useState("");
    const [loginValidated, setLoginValidated] = useState(true);
    const [loginHelpText, setLoginHelpText] = useState(" ");

    // Поле пароля пользователя
    const [password, setPassword] = useState("");
    const [passwordValidated, setPasswordValidated] = useState(true);
    const [passwordHelpText, setPasswordHelpText] = useState(" ");
    const [showPassword, setShowPassword] = useState(false);

    // Отображать ли спиннер загрузки во время авторизации
    const [isLoading, setIsLoading] = useState(false);

    // Доступна ли авторизация с такими логином, паролем
    const [loginDisabled, setLoginDisabled] = useState(true);

    // Логин или пароль не найдены в базе
    const [isCredentialsIncorrect, setIsCredentialsIncorrect] = useState(false);

    // Проверка возможности авторизации с такими логином, паролем
    useEffect(() => {
        if (loginValidated && passwordValidated && !isCredentialsIncorrect && login !== "" && password !== "") {
            setLoginDisabled(false);
        } else {
            setLoginDisabled(true);
        }
    }, [login, password, isCredentialsIncorrect]);

    // Обработчик изменения логина с валидацией
    const handleEmailChanged = (e) => {
        const val = e.target.value;
        const len = val.length;
        setLogin(val);
        setLoginValidated(false);
        setIsCredentialsIncorrect(false);
        if (val[len - 1] === ' ') {
            setLoginHelpText("В конце логина не может быть пробелов.");
        } else if (val[0] === ' ') {
            setLoginHelpText("В начале почты не может быть пробелов.");
        }
        else {
            setLoginValidated(true);
        }
    };

    // Обработчик изменения пароля с валидацией
    const handlePasswordChanged = (e) => {
        const val = e.target.value;
        const len = val.length;
        setPassword(val);
        setPasswordValidated(false);
        setIsCredentialsIncorrect(false);
        if (len < 10) {
            setPasswordHelpText("Пароль должен содержать от 10 символов.");
        } else {
            setPasswordValidated(true);
        }
    };

    // Обработчик кнопки показать пароль
    const onShowPasswordClick = () => {
        setShowPassword(!showPassword);
    };
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    // Обработчик кнопки авторизации
    const onLoginClick = e => {
        e?.preventDefault();

        if (loginDisabled) {
            return;
        }

        setIsLoading(true);
        setLoginDisabled(true);

        postRequestHandler('/api/v1/login',
            {
                login: login,
                pass: password
            },
                true)
            .then(response => {
                switch (response.status) {
                    case 200:
                        setIsAuthorized(true);
                        navigate("/generator", { replace: true });
                        break;
                    case 400:
                        setIsCredentialsIncorrect(true);
                        setAlertType('error');
                        setAlertMessage("Одно из полей заполнено неверно.");
                        setOpenAlert(true);
                        break;
                    case 403:
                        setIsCredentialsIncorrect(true);
                        setAlertType('error');
                        setAlertMessage("Логин или пароль неверны.");
                        setOpenAlert(true);
                        break;
                    default:
                        setAlertType('error');
                        setAlertMessage("Сервис временно недоступен. Попробуйте позднее.");
                        setOpenAlert(true);
                }
                setIsLoading(false);
                setLoginDisabled(false);
            })
    };

    const styles = {
        paperStyle: {
            padding :20,
            borderRadius: 15,
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: -180,
            marginLeft: -160,
            width: 280,
            height: 320,
        },
        iconStyle: {
            color:'rgba(255,0,0,0.51)',
            width: 50,
            height: 50,
            padding:'10px'
        },
        labelStyle: {
            marginBottom:'20px'
        },
        textFieldStyle: {
            marginBottom:'0px'
        },
        buttonLoginStyle: {
            position: 'absolute',
            borderRadius: 15,
            width: 280,
            bottom:'20px',
            left: '20px',
        }
    };

    return(
        <Paper elevation={12} style={styles.paperStyle}>
            <Grid align='center'>
                <LockOutlined style={styles.iconStyle} />
                <Typography style={styles.labelStyle} variant="h5" gutterBottom>
                    АВТОРИЗАЦИЯ
                </Typography>
            </Grid>

            <TextField
                style={styles.textFieldStyle}
                error={!loginValidated || isCredentialsIncorrect}
                onChange={handleEmailChanged}
                onKeyDown={(e) => {
                    if (e.code === "Enter" || e.code === "NumpadEnter") {
                        onLoginClick();
                    }
                }}
                helperText={loginValidated?" ":loginHelpText}
                fullWidth
                required
                variant="standard"
                label='Логин'
            />
            <FormControl fullWidth required error={!passwordValidated || isCredentialsIncorrect} variant="standard">
                <InputLabel htmlFor="login-password-text-field">Пароль</InputLabel>
                <Input
                    id="login-password-text-field"
                    style={styles.textFieldStyle}
                    onChange={handlePasswordChanged}
                    onKeyDown={(e) => {
                        if (e.code === "Enter" || e.code === "NumpadEnter") {
                            onLoginClick();
                        }
                    }}
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                onClick={onShowPasswordClick}
                                onMouseDown={handleMouseDownPassword}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                />
                <FormHelperText id="login-password-text-field">{passwordValidated?" ":passwordHelpText}</FormHelperText>
            </FormControl>

            <Button
                style={styles.buttonLoginStyle}
                onClick={onLoginClick}
                disabled={loginDisabled}
                fullWidth
                color='primary'
                variant='contained'
            >
                {isLoading?
                    <div> <PulseLoader speedMultiplier={2} color={"#ffffff"} size={7} /></div>:
                    "Войти"
                }
            </Button>
        </Paper>
    )
};

export default LoginPage;