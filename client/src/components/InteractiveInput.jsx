import './InteractiveInput.scss'

function InteractiveInput({code, setCode}) {
    return (
        <div className='input-row'>
            <input 
                value={code}
                type='text' 
                id='code' 
                onChange={e => setCode(e.target.value)}
                placeholder='Enter dark room code'
                autoComplete="off"
                className={code == '' ? 'move-right' : 'move-back'}
            ></input>
            <button className={
                code == '' ? 'fade-out' : 'fade-in' 
            }>Enter</button>
        </div>
    )
}

export default InteractiveInput