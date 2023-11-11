import React, { useEffect, useState } from "react";
import { Button, IconButton, LinearProgress} from '@mui/material';
import { ArrowBackIos, Cached, Download, Delete } from '@mui/icons-material';
import {DataGrid, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton, ruRU} from '@mui/x-data-grid';
import { useNavigate } from "react-router-dom";
import {Buffer} from "buffer";

import { postRequestHandler} from "./Requests";


const CouponsPage = ({ setOpenAlert, setAlertType, setAlertMessage }) => {
    let navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);

    // Строки таблицы
    const [rows, setRows] = useState([]);

    // Для обновления таблицы
    const [requestsNeedUpdate, setRequestsNeedUpdate] = useState(true);

    // Обработчик кнопки удаления купона
    const onDeleteClick = id => {
        setIsLoading(true);
        postRequestHandler('/api/v1/delete',
            {
                id: id
            },
            true)
            .then(response => {
                switch (response.status) {
                    case 200:
                        console.log("deleted");
                        setRequestsNeedUpdate(!requestsNeedUpdate);
                        break;
                    case 400:
                        setAlertType('error');
                        setAlertMessage("Неверная структура идентификатора.");
                        setOpenAlert(true);
                        break;
                    default:
                        setAlertType('error');
                        setAlertMessage("Сервис временно недоступен. Попробуйте позднее.");
                        setOpenAlert(true);
                }
            })
    };

    // Обработчик кнопки скачивания купона
    const onDownloadClick = (receiver, amount, style, code) => {
        setIsLoading(true);
        postRequestHandler('/api/v1/download',
            {
                receiver: receiver,
                amount: amount,
                style: style === 'Светлый'? '0': '1',
                code: code
            },
            true)
            .then(response => {
                switch (response.status) {
                    case 200:
                        const buffer = Buffer.from(response.data.coupon);
                        const blob = new Blob([buffer], {type: "image/png"});
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        document.body.appendChild(a);
                        a.style = 'display: none';
                        a.href = url;
                        a.target="_blank"
                        a.click();
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
                setIsLoading(false);
            })
    };

    const renderDeleteButton = (params) => {
        return (
            <IconButton
                color='error'
                onClick={() => onDeleteClick(params.row.id)}
            >
                <Delete fontSize="inherit" />
            </IconButton>
        )
    }

    const renderDownloadButton = (params) => {
        return (
            <IconButton
                color='info'
                onClick={() =>
                    onDownloadClick(
                        params.row.receiver,
                        params.row.amount,
                        params.row.style,
                        params.row.code
                    )}
            >
                <Download fontSize="inherit" />
            </IconButton>
        )
    }

    // Столбцы таблицы
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'receiver', headerName: 'Получатель', width: 270 },
        { field: 'code', headerName: 'Промокод', width: 100 },
        { field: 'amount', headerName: 'Номинал', width: 120 },
        { field: 'style', headerName: 'Цвет', minWidth: 90 },
        { field: 'created_time', headerName: 'Дата создания', minWidth: 170 },
        {
            field: 'generate',
            headerName: '',
            width: 60,
            sortable: false,
            renderCell: renderDownloadButton,
        },
        {
            field: 'delete',
            headerName: '',
            width: 60,
            sortable: false,
            renderCell: renderDeleteButton,
        }
    ];

    // Загрузка купонов с сервера
    useEffect(() => {
        setIsLoading(true);
        postRequestHandler('/api/v1/coupons',
            {}).then(response => {
                switch (response.status) {
                    case 200:
                        let rowsBuff = [];
                        response.data.data.forEach((req) => {
                            rowsBuff.push({
                                id: req.ID,
                                receiver: req.receiver,
                                amount: req.amount,
                                style: req.style === 0 ? "Светлый" : "Тёмный",
                                code: req.code,
                                created_time: req.created_time
                            })
                        })

                        setRows(rowsBuff);
                        break;
                    default:
                        setAlertType('error');
                        setAlertMessage("Сервис временно недоступен. Попробуйте позднее.");
                        setOpenAlert(true);
                }
                setIsLoading(false);
        });
    }, [requestsNeedUpdate])


    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <Button size="small"
                        startIcon={<ArrowBackIos />}
                        onClick={() => {
                            navigate("/generator", { replace: true });
                        }}
                >
                    назад
                </Button>
                <Button size="small"
                        startIcon={<Cached />}
                        onClick={() => {
                            setRequestsNeedUpdate(!requestsNeedUpdate)
                        }}
                >
                    обновить
                </Button>
                <GridToolbarFilterButton />
                <GridToolbarExport
                    csvOptions={{
                        fileName: 'Купоны',
                        delimiter: ';',
                        utf8WithBom: true,
                        fields: ['id', 'receiver', 'code', 'amount', 'style', 'created_time']
                    }}
                />
            </GridToolbarContainer>
        );
    }


    return (
        <DataGrid
            style={{ position: 'absolute', bottom: 0, right: 0, left: 0, top: 0}}
            localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
            rows={rows}
            columns={columns}
            slots={{
                loadingOverlay: LinearProgress,
                toolbar: CustomToolbar,
            }}
            loading={isLoading}
        />
    );
};

export default CouponsPage;