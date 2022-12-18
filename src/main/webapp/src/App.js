import './App.css';
import * as React from 'react';
import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import {createTheme, styled, ThemeProvider} from '@mui/material/styles';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {TransitionProps} from '@mui/material/transitions';
import Slide from '@mui/material/Slide';
import CssBaseline from "@mui/material/CssBaseline";

const Item = styled(Paper)(({theme}) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'left',
    color: theme.palette.text.secondary,
}));

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function Head() {
    return (
        <header>
            <h1>React Memo App</h1>
        </header>
    );
}

function CreateMemo(props) {
    const [open, setOpen] = React.useState(false);

    // updated memo
    const [memo, setMemo] = useState();
    // updated tags
    const [tags, setTags] = useState();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleCreate = () => {
        const newMemoObj = {memo: memo, tags: tags};
        fetch("/memo", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newMemoObj)
        })
            .then(res => res.json())
            .then(
                result => {
                    props.onClick(result);
                    handleClose();
                },
                error => {
                    console.log(error);
                }
            )

    };

    return (
        <>
            <h2>Create Memo</h2>
            <Button variant={"contained"} size={"small"} onClick={handleClickOpen}>Create</Button>
            <Dialog
                fullScreen
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
            >
                <DialogTitle>Create Memo</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Creating Memo
                    </DialogContentText>
                    <p/>
                    <TextField
                        required
                        id="standard-multiline-static"
                        name="memo"
                        label="Memo"
                        variant="outlined"
                        fullWidth
                        multiline
                        color="success"
                        rows={20}
                        defaultValue=""
                        onChange={event => setMemo(event.target.value)}
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
                        onChange={event => setTags(event.target.value)}
                        onMouseEnter={event => event.target}
                    />
                </DialogContent>
                <DialogActions>
                    <Button type="submit" onClick={() => {
                        handleCreate();
                    }}>Create</Button>
                    <Button type="submit" onClick={() => {
                        setOpen(false);
                    }}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

function SearchBox(props) {
    return (
        <article>
            <h2>Search</h2>
            <form onSubmit={event => {
                event.preventDefault();
                const word = event.target.search.value;

                fetch("/memo/" + word)
                    .then(res => res.json())
                    .then(result => {
                            props.onClick(result);
                        },
                        error => {
                            console.log(error);
                        }
                    )
            }}>
                <TextField
                    id="outlined-basic"
                    name="search"
                    label="Search"
                    variant="outlined"
                    fullWidth
                    defaultValue=""
                    onMouseEnter={event => event.target}
                />
            </form>
        </article>
    );
}

function MemoTable(props) {
    // data from server
    const memos = props.memos;

    const [open, setOpen] = React.useState(false);

    // selected Memo
    const [memoObj, setMemoObj] = useState();

    // updated memo
    const [memo, setMemo] = useState();
    // updated tags
    const [tags, setTags] = useState();

    // when select a memo
    const handleClickOpen = (memoObj) => {
        setMemoObj(memoObj);
        setMemo(memoObj.memo);
        setTags(memoObj.tags);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleUpdate = () => {
        const updatedMemoObj = {memo: memo, tags: tags};

        // Check if contains updated memo
        fetch("/memo/contains", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updatedMemoObj)
        })
            .then(res => res.json())
            .then(
                containsUpdatedMemo => {
                    // Update(add) only if updatedMemo NOT exists which means data was changed
                    if (!containsUpdatedMemo) {
                        // Updated so let's remove the original memo
                        fetch("/memo", {
                            method: 'DELETE',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(memoObj)
                        })
                            .then(res => res.json())
                            .then(
                                () => {
                                    // Add/Create the new updated memo
                                    fetch("/memo", {
                                        method: 'POST',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify(updatedMemoObj)
                                    })
                                        .then(res => res.json())
                                        .then(
                                            result => {
                                                props.onClick(result);
                                                handleClose();
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

    };

    const handleDelete = () => {
        // Remove
        fetch("/memo", {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(memoObj)
        })
            .then(res => res.json())
            .then(
                result => {
                    props.onClick(result);
                    handleClose();
                },
                (error) => {
                    console.log(error);
                }
            )
    };

    return (
        <article>
            <h2>Memos</h2>
            <TableContainer component={Paper}>
                <Table sx={{minWidth: 650}} size="small" aria-label="a dense table">
                    <TableBody>
                        {memos.map((memoObj, idx) => (
                            <TableRow
                                key={idx}
                                sx={{'&:last-child td, &:last-child th': {fontSize: "0.8rem", border: 0}}}
                                onClick={() => {
                                    handleClickOpen(memoObj);
                                }}
                            >
                                <TableCell component="th" scope="row" variant="body">
                                    {memoObj.memo.split("\n").map((line, idx) => (
                                        <p key={idx}>{line}</p>
                                    ))}
                                    <br/>
                                    <b>Tags</b>:&nbsp;{memoObj.tags.length > 0 ? memoObj.tags : "No data"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog
                fullScreen
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
            >
                <DialogTitle>Update Memo</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Selected Memo
                    </DialogContentText>
                    <p/>
                    <TextField
                        required
                        id="standard-multiline-static"
                        name="memo"
                        label="Memo"
                        variant="outlined"
                        fullWidth
                        multiline
                        color="success"
                        rows={20}
                        value={memo}
                        onChange={event => setMemo(event.target.value)}
                        onMouseEnter={event => event.target}
                    />
                    <p/>
                    <TextField
                        id="outlined-basic"
                        name="tags"
                        label="Tags"
                        variant="outlined"
                        fullWidth
                        value={tags}
                        onChange={event => setTags(event.target.value)}
                        onMouseEnter={event => event.target}
                    />
                </DialogContent>
                <DialogActions>
                    <Button type="submit" onClick={() => {
                        handleUpdate();
                    }}>Update</Button>
                    <Button type="submit" onClick={() => {
                        handleDelete();
                    }}>Delete</Button>
                    <Button type="submit" onClick={() => {
                        setOpen(false);
                    }}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </article>
    );
}

function loadMemos(setMemos) {
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
}

export default function App() {
    const theme = React.useMemo(
        () =>
            createTheme({
                typography: {
                    fontSize: 12
                },
            }),
        [],
    );

    // Data
    const [memos, setMemos] = useState([]);

    // Retrieve All Memos from Server-side
    // Note: the empty deps array [] means
    // this useEffect will run once
    // similar to componentDidMount()
    // https://reactjs.org/docs/faq-ajax.html
    useEffect(() => {
        loadMemos(setMemos);
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Container>
                <Box sx={{width: '100%'}}>
                    <Stack spacing={2}>
                        <Item>
                            <Head/>
                        </Item>
                        <Item>
                            <CreateMemo onClick={(retrievedMemos) => {
                                setMemos(retrievedMemos);
                            }}></CreateMemo>
                        </Item>
                        <Item>
                            <SearchBox onClick={retrievedMemos => {
                                setMemos(retrievedMemos);
                            }}></SearchBox>
                        </Item>
                        <Item>
                            <MemoTable memos={memos} onClick={retrievedMemos => {
                                setMemos(retrievedMemos);
                            }}></MemoTable>
                        </Item>
                    </Stack>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
