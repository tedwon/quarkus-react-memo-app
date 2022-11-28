import './App.css';
import {useEffect, useState} from "react";
import produce from "immer";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import {styled} from '@mui/material/styles';
import Button from '@mui/material/Button';
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

    // Note: the empty deps array [] means
    // this useEffect will run once
    // similar to componentDidMount()
    // https://reactjs.org/docs/faq-ajax.html
    useEffect(() => {
        fetch("http://localhost:8080/memo")
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

    // For Update
    // Original Memo
    const [orgMemo, setOrgMemo] = useState(null);

    let createMenu, memoDetailBody, memoDeleteButton = null;

    if (mode === 'CREATE') {
        createMenu = null;
        memoDetailBody = <Create onCreate={newMemoValue => {
            const _newMemo = {memo: newMemoValue};
            const copyMemos = [...memos];
            const requestOptions = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(_newMemo)
            };
            fetch("http://localhost:8080/memo", requestOptions)
                .then(res => res.json())
                .then(
                    result => {
                        if (result) {
                            copyMemos.push(_newMemo);
                            setMemos(copyMemos);
                        }
                    },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    error => {
                        console.log(error);
                    }
                )
            setMode('CREATE');
        }}></Create>
    } else if (mode === 'UPDATE') {
        createMenu = <Button variant="outlined" type="submit" onClick={event => {
            event.preventDefault();
            setMode('CREATE');
        }}>Create Memo</Button>
        memoDetailBody = <Update orgMemo={orgMemo} onUpdate={newMemoValue => {
            const memo = {memo: orgMemo};
            const _newMemo = {memo: newMemoValue};

            // Remove
            const deleteRequestOptions = {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(memo)
            };
            fetch("http://localhost:8080/memo", deleteRequestOptions)
                .then(res => res.json())
                .then(
                    () => {
                        // Add
                        const requestOptions = {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(_newMemo)
                        };
                        fetch("http://localhost:8080/memo", requestOptions)
                            .then(res => res.json())
                            .then(
                                () => {
                                    // Use Immer.js
                                    setMemos(produce(memos, draft => {
                                        for (let i = 0; i < memos.length; i++) {
                                            if (draft[i].memo === orgMemo) {
                                                draft[i] = _newMemo;
                                                break;
                                            }
                                        }
                                    }));
                                },
                                // Note: it's important to handle errors here
                                // instead of a catch() block so that we don't swallow
                                // exceptions from actual bugs in components.
                                (error) => {
                                    console.log(error);
                                }
                            )
                    },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    (error) => {
                        console.log(error);
                    }
                )
            setMode('CREATE');
        }}></Update>
        memoDeleteButton = (
            <Button variant="contained" type="submit" onClick={() => {
                const memo = {memo: orgMemo};

                // Remove
                const deleteRequestOptions = {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(memo)
                };
                fetch("http://localhost:8080/memo", deleteRequestOptions)
                    .then(res => res.json())
                    .then(
                        () => {
                            setMemos(produce([], draft => {
                                for (let i = 0; i < memos.length; i++) {
                                    if (memos[i].memo !== orgMemo) {
                                        draft.push(memos[i])
                                    }
                                }
                            }));
                        },
                        // Note: it's important to handle errors here
                        // instead of a catch() block so that we don't swallow
                        // exceptions from actual bugs in components.
                        (error) => {
                            console.log(error);
                        }
                    )
                setMode('CREATE');
            }}>Delete</Button>
        );
    }

    return (
        <Container fixed>
            <Box sx={{width: '100%'}}>
                <Stack spacing={2}>
                    <Item>
                        <Head></Head>
                        {createMenu}
                        {memoDetailBody}
                        {memoDeleteButton}
                    </Item>
                    <Item>
                        <MemoList memos={memos} onClick={(_memo) => {
                            setOrgMemo(_memo);
                            setMode('UPDATE');
                        }}></MemoList>
                    </Item>
                </Stack>
            </Box>
        </Container>

    );
}

function Head() {
    return (
        <header>
            <h1>React Memo App on Quarkus</h1>
        </header>
    );
}

function MemoList(props) {
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
                        {props.memos.map((row) => (

                            <TableRow
                                key={row.memo}
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                            >
                                <TableCell component="th" scope="row" onClick={() => {
                                    props.onClick(row.memo);
                                }}>
                                    {row.memo}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </article>
    );
}

function Create(props) {
    return (
        <article>
            <h2>Create Memo</h2>
            <form onSubmit={event => {
                event.preventDefault();
                const newMemoValue = event.target.memo.value;
                if (newMemoValue !== '')
                    props.onCreate(newMemoValue);
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
    );
}

function Update(props) {
    const [orgMemo, setOrgMemo] = useState(props.orgMemo);
    return (
        <article>
            <h2>Update Memo</h2>
            <form onSubmit={event => {
                event.preventDefault();
                const newMemoValue = event.target.memo.value;
                if (newMemoValue !== '')
                    props.onUpdate(newMemoValue);
            }}>
                <TextField
                    id="standard-multiline-static"
                    name="memo"
                    label="Memo"
                    multiline
                    rows={4}
                    fullWidth
                    value={orgMemo}
                    variant="standard"
                    onChange={event => setOrgMemo(event.target.value)}
                    onMouseEnter={event => event.target}
                />
                <Button variant="contained" type="submit">Update</Button>
            </form>
            <p/>
        </article>
    );
}

export default App;
