import './App.css';
import {useEffect, useState} from "react";
import produce from "immer";

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import {styled} from '@mui/material/styles';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const Item = styled(Paper)(({theme}) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'left',
    color: theme.palette.text.secondary,
}));

function App() {
    // Screen
    const [mode, setMode] = useState(null);

    // Data
    const [memos, setMemos] = useState([]);

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

    // For Update
    // Original Memo
    const [orgMemo, setOrgMemo] = useState(null);

    let memoDetailBody, memoDeleteButton = null;

    if (mode === 'CREATE') {
        memoDetailBody = <Create onCreate={newMemoValue => {
            const _newMemo = {memo: newMemoValue};
            const copyMemos = [...memos];
            const requestOptions = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(_newMemo)
            };
            fetch("/memo", requestOptions)
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
            setMode(null);
        }}></Create>
    } else if (mode === 'UPDATE') {
        memoDetailBody = <Update orgMemo={orgMemo} onUpdate={newMemoValue => {
            const memo = {memo: orgMemo};
            const _newMemo = {memo: newMemoValue};

            // Remove
            const deleteRequestOptions = {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(memo)
            };
            fetch("/memo", deleteRequestOptions)
                .then(res => res.json())
                .then(
                    () => {
                        // Add
                        const requestOptions = {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(_newMemo)
                        };
                        fetch("/memo", requestOptions)
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
            setMode(null);
        }}></Update>

        memoDeleteButton = <Button variant="contained" type="submit" onClick={() => {
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
            setMode(null);
        }}>Delete</Button>
    }

    return (
        <div className="App">
            <Box sx={{width: '100%'}}>
                <Stack spacing={2}>
                    <Item>
                        <Head></Head>
                    </Item>
                    <Item>
                        <a href="create" onClick={event => {
                            event.preventDefault();
                            setMode('CREATE');
                        }}>Create Memo</a>
                        {memoDetailBody}
                        {memoDeleteButton}
                    </Item>
                    <Item>
                        <Memos memos={memos} onClick={(_memo) => {
                            setOrgMemo(_memo);
                            setMode('UPDATE');
                        }}></Memos>
                    </Item>
                </Stack>
            </Box>
        </div>

    );
}

function Head() {
    return (
        <header>
            <h1>React Memo App on Quarkus</h1>
        </header>
    );
}

function Memos(props) {
    const rows = [];
    for (let i = 0; i < props.memos.length; i++) {
        const memo = props.memos[i].memo;
        rows.push(
            <tr key={i}>
                <td className="App-table" onClick={() => {
                    props.onClick(memo);
                }}>{memo}</td>
            </tr>
        );
    }
    return (
        <article>
            <h2>Memos</h2>
            <table className="App-table">
                <tbody>
                {rows}
                </tbody>
            </table>
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
                <TextField id="outlined-basic" label="Memo" variant="outlined" name="memo" size="40"
                           onMouseEnter={event => event.target}/><p/>
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
                <TextField id="outlined-basic" label="Memo" variant="outlined" name="memo" size="40"
                           value={orgMemo}
                           onChange={event => setOrgMemo(event.target.value)} onMouseEnter={event => event.target}/><p/>
                <Button variant="contained" type="submit">Update</Button>
            </form>
            <p/>

        </article>
    );
}

export default App;
