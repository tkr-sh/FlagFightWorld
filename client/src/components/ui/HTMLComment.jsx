const ReactComment = ({ text }) => {
  return <div dangerouslySetInnerHTML={{ __html: `<!-- ${text} -->` }}/>
}

export default ReactComment;
