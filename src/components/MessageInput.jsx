import './MessageInput.scss'

function MessageInput({ handleSendMessage, messageInputValue, setMessageInputValue, messageInputElement }) {
    return (
        <form className='message-input-container' 
            onSubmit={handleSendMessage}>
            <div className='message-input-wrapper-container'>
                <div className='message-input-wrapper'>
                    <textarea 
                        placeholder='Aa'
                        value={messageInputValue} 
                        id='messageInput'
                        onChange={e => {setMessageInputValue(e.target.value)}}
                        onKeyUp={handleSendMessage}
                    ></textarea>
                </div>
                <button>Send</button>
            </div>
        </form>
    )
}

export default MessageInput