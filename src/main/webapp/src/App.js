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
        <Container maxWidth="xl">
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
        createUpdateInput = <CreateMemo mode={mode} onCreate={newMemo => {
            fetch("/memo", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newMemo)
            })
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
        createUpdateInput = <UpdateMemo memo={memo} onUpdate={(updatedMemo, mode) => {
            if (mode === 'CREATE') {
                props.onClick(null, mode)
                return
            }

            // Check if contains updated memo
            fetch("/memo/contains", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(updatedMemo)
            })
                .then(res => res.json())
                .then(
                    containsUpdatedMemo => {
                        // Update(add) only if updatedMemo NOT exists which means data was changed
                        if (!containsUpdatedMemo) {
                            // Remove original memo
                            fetch("/memo", {
                                method: 'DELETE',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(memo)
                            })
                                .then(res => res.json())
                                .then(
                                    () => {
                                        // Add updated memo
                                        fetch("/memo", {
                                            method: 'POST',
                                            headers: {'Content-Type': 'application/json'},
                                            body: JSON.stringify(updatedMemo)
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

function CreateMemo(props) {
    return <article>
        <h2>Create Memo</h2>
        <form onSubmit={event => {
            event.preventDefault();
            const newTitleStr = event.target.title.value;
            const newMemoStr = event.target.memo.value;
            const newTagsStr = event.target.tags.value;
            if (newTitleStr !== '') {
                const newMemo = {title: newTitleStr, memo: newMemoStr, tags: newTagsStr};
                props.onCreate(newMemo);
                event.target.title.value = "";
                event.target.memo.value = "";
                event.target.tags.value = "";
            }
        }}>
            <TextField
                required
                id="outlined-required"
                name="title"
                label="Title"
                variant="outlined"
                fullWidth
                defaultValue=""
                onMouseEnter={event => event.target}
            />
            <p/>
            <TextField
                id="standard-multiline-static"
                name="memo"
                label="Memo"
                variant="outlined"
                fullWidth
                multiline
                rows={5}
                defaultValue=""
                onMouseEnter={event => event.target}
            />
            <p/>
            <TextField
                id="outlined-basic"
                name="tags"
                label="Tags"
                variant="outlined"
                fullWidth
                defaultValue=""
                onMouseEnter={event => event.target}
            />
            <p/>
            <Button variant="contained" type="submit">Create</Button>
        </form>
    </article>
}

function UpdateMemo(props) {
    const [mode, setMode] = useState(null);
    const [title, setTitle] = useState(props.memo.title);
    const [memo, setMemo] = useState(props.memo.memo);
    const [tags, setTags] = useState(props.memo.tags);

    return (
        <article>
            <h2>Update Memo</h2>
            <form onSubmit={event => {
                event.preventDefault();
                const updatedTitleStr = event.target.title.value;
                const updatedMemoStr = event.target.memo.value;
                const updatedTagsStr = event.target.tags.value;
                if (updatedTitleStr !== '') {
                    const updatedMemo = {title: updatedTitleStr, memo: updatedMemoStr, tags: updatedTagsStr};
                    props.onUpdate(updatedMemo, mode);
                }
            }}>
                <TextField
                    required
                    id="outlined-required"
                    name="title"
                    label="Required"
                    variant="outlined"
                    fullWidth
                    value={title}
                    onChange={event => setTitle(event.target.value)}
                    onMouseEnter={event => event.target}
                />
                <p/>
                <TextField
                    id="standard-multiline-static"
                    name="memo"
                    label="Memo"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={5}
                    value={memo}
                    onChange={event => setMemo(event.target.value)}
                    onMouseEnter={event => event.target}
                />
                <p/>
                <TextField
                    id="outlined-basic"
                    name="tags"
                    label="Outlined"
                    variant="outlined"
                    fullWidth
                    value={tags}
                    onChange={event => setTags(event.target.value)}
                    onMouseEnter={event => event.target}
                />
                <p/>
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

function DeleteButton(props) {
    let mode = props.mode;
    let deleteButton = null;

    if (mode === 'UPDATE') {
        const memo = props.memo;

        deleteButton = (
            <Button variant="contained" type="submit" onClick={() => {
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

function MemoTable(props) {
    const memos = props.memos;
    return (
        <article>
            <h2>Memos</h2>
            <TableContainer component={Paper}>
                <Table sx={{minWidth: 650}} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{width: '20%'}}>Title</TableCell>
                            <TableCell>Memo</TableCell>
                            <TableCell sx={{width: '10%'}}>tags</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {memos.map((memo) => (
                            <TableRow
                                key={memo.title}
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                            >
                                <TableCell component="th" scope="row" onClick={() => {
                                    props.onClick(memo);
                                }}>
                                    <TextField
                                        variant="standard"
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        fullWidth
                                        multiline
                                        defaultValue={memo.title}
                                    />
                                </TableCell>
                                <TableCell component="th" scope="row" onClick={() => {
                                    props.onClick(memo);
                                }}>
                                    <TextField
                                        variant="standard"
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        fullWidth
                                        multiline
                                        defaultValue={memo.memo}
                                    />
                                </TableCell>
                                <TableCell component="th" scope="row" onClick={() => {
                                    props.onClick(memo);
                                }}>
                                    <TextField
                                        variant="standard"
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        fullWidth
                                        multiline
                                        defaultValue={memo.tags}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </article>
    );
}