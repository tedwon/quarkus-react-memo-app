import './App.css';
import {useEffect, useState} from "react";
import produce from "immer";

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

        memoDeleteButton = <input type="button" value="Delete" onClick={() => {
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
        }}/>
    }

    return (
        <div className="App">
            <Head></Head>
            <ul>
                <li>
                    <a href="create" onClick={event => {
                        event.preventDefault();
                        setMode('CREATE');
                    }}>Create Memo</a>
                </li>
            </ul>

            {memoDetailBody}

            {memoDeleteButton}

            <Memos memos={memos} onClick={(_memo) => {
                setOrgMemo(_memo);
                setMode('UPDATE');
            }}></Memos>
        </div>
    );
}

function Head() {
    return (
        <header>
            <h1>Memo App</h1>
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
                <p><input type="text" name="memo" placeholder="memo..." onMouseEnter={event => event.target}/></p>
                <p><input type="submit" value="Create"/></p>
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
                <p><input type="text" name="memo" placeholder="memo..." size="40" value={orgMemo}
                          onChange={event => setOrgMemo(event.target.value)} onMouseEnter={event => event.target}/></p>
                <p><input type="submit" value="Update"/></p>
            </form>

        </article>
    );
}

export default App;
