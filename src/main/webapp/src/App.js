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

    // For Update
    // Original Memo
    const [orgMemo, setOrgMemo] = useState('');

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
                        <Head></Head>
                        <CreateUpdateInput mode={mode} orgMemo={orgMemo}
                                           onClick={(retrievedMemos, newMode) => {
                                               if (retrievedMemos !== null)
                                                   setMemos(retrievedMemos);
                                               setMode(newMode);
                                           }}></CreateUpdateInput>
                        <DeleteButton mode={mode} orgMemo={orgMemo}
                                      onClick={(retrievedMemos, newMode) => {
                                          setMemos(retrievedMemos);
                                          setMode(newMode);
                                      }}></DeleteButton>
                    </Item>
                    <Item>
                        <MemoTable memos={memos} onClick={memo => {
                            setOrgMemo(memo);
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
    let createUpdateContext = null;
    let mode = props.mode;

    if (mode === 'CREATE') {
        createUpdateContext = <Create mode={props.mode} onCreate={newMemoValue => {
            const _newMemo = {memo: newMemoValue};
            const requestOptions = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(_newMemo)
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
        }}></Create>
    } else if (mode === 'UPDATE') {
        const orgMemo = props.orgMemo;
        createUpdateContext = <Update orgMemo={orgMemo} onUpdate={(newMemoValue, mode) => {
            const _newMemo = {memo: newMemoValue};

            if (mode === 'CREATE') {
                props.onClick(null, mode)
                return
            }

            // Check if contains
            fetch("/memo/contains/" + newMemoValue,)
                .then(res => res.json())
                .then(
                    result => {
                        // Update only if data changed
                        if (!result) {
                            const requestOptions = {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(_newMemo)
                            };
                            fetch("/memo/update/" + orgMemo, requestOptions)
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
        }}></Update>
    }

    return createUpdateContext;
}

function DeleteButton(props) {
    let mode = props.mode;
    let memoDeleteButton = null;

    if (mode === 'UPDATE') {
        const orgMemo = props.orgMemo;

        memoDeleteButton = (
            <Button variant="contained" type="submit" onClick={() => {
                const memo = {memo: orgMemo};

                // Remove
                const deleteRequestOptions = {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(memo)
                };
                fetch("/memo", deleteRequestOptions)
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
    return memoDeleteButton;
}

function Create(props) {
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

function Update(props) {
    const [mode, setMode] = useState(null);
    const [orgMemo, setOrgMemo] = useState(props.orgMemo);

    return (
        <article>
            <h2>Update Memo</h2>
            <form onSubmit={event => {
                event.preventDefault();
                const newMemoValue = event.target.memo.value;
                if (newMemoValue !== '')
                    props.onUpdate(newMemoValue, mode);
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
    let memos = props.memos;
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
                        {memos.map((row) => (
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