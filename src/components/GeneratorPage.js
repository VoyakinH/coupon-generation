import React, { useState } from 'react';
import { Grid, Paper, TextField, Button, Typography, ToggleButton, ToggleButtonGroup, Stack } from '@mui/material'
import { PulseLoader } from "react-spinners";
import { useNavigate } from 'react-router-dom';
import { Buffer } from 'buffer';

import { postRequestHandler } from "./Requests";

const GeneratorPage = ({ setOpenAlert, setAlertType, setAlertMessage }) => {
    let navigate = useNavigate();

    const [receiver, setReceiver] = useState("");
    const [amount, setAmount] = useState("");
    const [style, setStyle] = useState(0);

    const [isGenerating, setIsGenerating] = useState(false);


    const styles = {
        paperStyleGenerator: {
            padding :20,
            borderRadius: 15,
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: -195,
            marginLeft: -160,
            width: 280,
            height: 350,
        },
        labelStyle: {
            marginBottom:'20px'
        },
        textFieldStyle: {
            marginBottom:'8px'
        },
        buttonGenerateStyle: {
            position: 'absolute',
            borderRadius: 15,
            width: 280,
            bottom:'70px',
            left: '20px',
        },
        buttonCouponsStyle: {
            position: 'absolute',
            borderRadius: 15,
            width: 280,
            bottom:'20px',
            left: '20px',
        },
    };

    // Обработчик кнопки генерации купона
    const onGenerateClick = e => {
        e.preventDefault();
        setIsGenerating(true);

        postRequestHandler('/api/v1/generate',
            {
                receiver: receiver,
                amount: amount,
                style: style
            },
            true)
            .then(response => {
                switch (response.status) {
                    case 200:
                        setAlertType('success');
                        setAlertMessage(`Купон для ${receiver} сгенерирован.`);
                        setOpenAlert(true);

                        const buffer = Buffer.from(response.data.coupon);
                        const blob = new Blob([buffer], {type: "image/png"});
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        document.body.appendChild(a);
                        a.style = 'display: none';
                        a.href = url;
                        a.target="_blank"
                        a.click();
                        // window.URL.revokeObjectURL(url);
                        break;
                    case 400:
                        setAlertType('error');
                        setAlertMessage("Одно из полей заполнено неверно.");
                        setOpenAlert(true);
                        break;
                    default:
                        setAlertType('error');
                        setAlertMessage("Сервис временно недоступен. Попробуйте позднее.");
                        setOpenAlert(true);
                }
                setIsGenerating(false);
            })
    };


    return(
        <Paper elevation={12} style={styles.paperStyleGenerator}>
            <Grid align='center'>
                <Typography style={styles.labelStyle} variant="h5" gutterBottom>
                    Генератор купона
                </Typography>
            </Grid>

            <Stack
                direction="column"
            >
                <TextField
                    style={styles.textFieldStyle}
                    onChange={(e) => {setReceiver(e.target.value)}}
                    value={receiver}
                    fullWidth
                    variant="standard"
                    label='Получатель'
                />

                <TextField
                    style={styles.textFieldStyle}
                    onChange={(e) => {setAmount(e.target.value)}}
                    value={amount}
                    fullWidth
                    required
                    variant="standard"
                    type='number'
                    label='Номинал купона'
                />

                <Typography sx={{ fontSize: 14, paddingBottom: 1 }} color="text.secondary">
                    Цвет купона
                </Typography>

                <ToggleButtonGroup
                    value={style}
                    exclusive
                    size="small"
                    onChange={(_, value) => {
                        if (value !== null) {
                            setStyle(value);
                        }
                    }}
                    aria-label="coupon style"
                >
                    <ToggleButton value={0} aria-label="white syle">
                        Светлый
                    </ToggleButton>
                    <ToggleButton value={1} aria-label="black style">
                        Тёмный
                    </ToggleButton>
                </ToggleButtonGroup>

                <Button
                    style={styles.buttonGenerateStyle}
                    onClick={onGenerateClick}
                    disabled={isGenerating}
                    fullWidth
                    color='primary'
                    variant='contained'
                >
                    {
                        isGenerating ?
                            <div><PulseLoader speedMultiplier={1} color={"#072fa9"} size={6}/></div> :
                            'Генерировать'
                    }
                </Button>

                <Button
                    style={styles.buttonCouponsStyle}
                    onClick={_ => {navigate("/coupons", { replace: true })}}
                    fullWidth
                    color='primary'
                    variant='outlined'
                >
                    Готовые купоны
                </Button>
            </Stack>
        </Paper>
    );
}

export default GeneratorPage;
