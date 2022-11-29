import './App.css';
import {useEffect, useState} from "react";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import {styled} from '@mui/material/styles';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const Item = styled(Paper)(({theme}) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'left',
    color: theme.palette.text.secondary,
}));

function App() {
    // Screen
    const [mode, setMode] = useState('CREATE');

    // Data
    const [memos, setMemos] = useState([]);

    // For UpdateMemo
    const [memo, setMemo] = useState('');

    // Retrieve All Memos from Server-side
    // Note: the empty deps array [] means
    // this useEffect will run once
    // similar to componentDidMount()
    // https://reactjs.org/docs/faq-ajax.html
    useEffect(() => {
        fetch("/memo")
            .then(res => res.json())
            .then(result => {
                    setMemos(result);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                error => {
                    console.log(error);
                }
            )
    }, [])

    return (
        <Container fixed>
            <Box sx={{width: '100%'}}>
                <Stack spacing={2}>
                    <Item>
                        <Head/>
                        <CreateUpdateInput mode={mode} memo={memo}
                                           onClick={(retrievedMemos, newMode) => {
                                               if (retrievedMemos !== null)
                                                   setMemos(retrievedMemos);
                                               setMode(newMode);
                                           }}></CreateUpdateInput>
                        <DeleteButton mode={mode} memo={memo}
                                      onClick={(retrievedMemos, newMode) => {
                                          setMemos(retrievedMemos);
                                          setMode(newMode);
                                      }}></DeleteButton>
                    </Item>
                    <Item>
                        <MemoTable memos={memos} onClick={memo => {
                            setMemo(memo);
                            setMode('UPDATE');
                        }}></MemoTable>
                    </Item>
                </Stack>
            </Box>
        </Container>
    );
}

export default App;

function Head() {
    return (
        <header>
            <h1>React Memo App on Quarkus</h1>
        </header>
    );
}

function CreateUpdateInput(props) {
    let createUpdateInput = null;
    let mode = props.mode;

    if (mode === 'CREATE') {
        createUpdateInput = <CreateMemo mode={props.mode} onCreate={newMemoStr => {
            const newMemo = {memo: newMemoStr};
            const requestOptions = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newMemo)
            };
            fetch("/memo", requestOptions)
                .then(res => res.json())
                .then(
                    result => {
                        props.onClick(result, 'CREATE');
                    },
                    error => {
                        console.log(error);
                    }
                )
        }}></CreateMemo>
    } else if (mode === 'UPDATE') {
        const memo = props.memo;
        createUpdateInput = <UpdateMemo memo={memo} onUpdate={(newMemoStr, mode) => {
            const newMemo = {memo: newMemoStr};

            if (mode === 'CREATE') {
                props.onClick(null, mode)
                return
            }

            // Check if contains
            fetch("/memo/contains/" + newMemoStr,)
                .then(res => res.json())
                .then(
                    result => {
                        // UpdateMemo only if data changed
                        if (!result) {
                            const requestOptions = {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(newMemo)
                            };
                            fetch("/memo/update/" + memo, requestOptions)
                                .then(res => res.json())
                                .then(
                                    result => {
                                        props.onClick(result, 'CREATE')
                                    },
                                    (error) => {
                                        console.log(error);
                                    }
                                )
                        }
                    },
                    (error) => {
                        console.log(error);
                    }
                )
        }}></UpdateMemo>
    }

    return createUpdateInput;
}

function DeleteButton(props) {
    let mode = props.mode;
    let deleteButton = null;

    if (mode === 'UPDATE') {
        const memoStr = props.memo;

        deleteButton = (
            <Button variant="contained" type="submit" onClick={() => {
                const memo = {memo: memoStr};

                // Remove
                fetch("/memo", {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(memo)
                })
                    .then(res => res.json())
                    .then(
                        result => {
                            props.onClick(result, 'CREATE')
                        },
                        (error) => {
                            console.log(error);
                        }
                    )
            }}>Delete</Button>
        );
    }
    return deleteButton;
}

function CreateMemo(props) {
    return <article>
        <h2>Create Memo</h2>
        <form onSubmit={event => {
            event.preventDefault();
            const newMemoValue = event.target.memo.value;
            if (newMemoValue !== '') {
                props.onCreate(newMemoValue);
                event.target.memo.value = "";
            }
        }}>
            <TextField
                id="standard-multiline-static"
                name="memo"
                label="Memo"
                multiline
                rows={4}
                fullWidth
                defaultValue=""
                variant="standard"
                onMouseEnter={event => event.target}
            />
            <p/>
            <Button variant="contained" type="submit">Create</Button>
        </form>
    </article>
}

function UpdateMemo(props) {
    const [mode, setMode] = useState(null);
    const [memo, setMemo] = useState(props.memo);

    return (
        <article>
            <h2>Update Memo</h2>
            <form onSubmit={event => {
                event.preventDefault();
                const newMemoStr = event.target.memo.value;
                if (newMemoStr !== '')
                    props.onUpdate(newMemoStr, mode);
            }}>
                <TextField
                    id="standard-multiline-static"
                    name="memo"
                    label="Memo"
                    multiline
                    rows={4}
                    fullWidth
                    value={memo}
                    variant="standard"
                    onChange={event => setMemo(event.target.value)}
                    onMouseEnter={event => event.target}
                />
                <ButtonGroup variant="contained" aria-label="outlined primary button group">
                    <Button type="submit" onClick={() => {
                        setMode('UPDATE');
                    }}>Update</Button>
                    <Button type="submit" onClick={() => {
                        setMode('CREATE');
                    }}>Cancel</Button>
                </ButtonGroup>
            </form>
            <p/>
        </article>
    );
}

function MemoTable(props) {
    const memos = props.memos;
    return (
        <article>
            <h2>Memos</h2>
            <TableContainer component={Paper}>
                <Table sx={{minWidth: 650}} size="big" aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Memo</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {memos.map((memo) => (
                            <TableRow
                                key={memo.memo}
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                            >
                                <TableCell component="th" scope="row" onClick={() => {
                                    props.onClick(memo.memo);
                                }}>
                                    {memo.memo}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </article>
    );
}