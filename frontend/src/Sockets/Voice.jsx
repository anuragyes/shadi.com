import { useParams, useSearchParams } from "react-router-dom";

const VoiceCall = () => {
  const { callId } = useParams();
  const [searchParams] = useSearchParams();

  const friendId = searchParams.get("friendId");
  const callType = searchParams.get("type"); // incoming | outgoing

  console.log("Call ID:", callId);
  console.log("Friend ID:", friendId);
  console.log("Call Type:", callType);

  return (
    <div>
      <h2>Voice Call</h2>
      <p>Call ID: {callId}</p>
      <p>Friend ID: {friendId}</p>
      <p>Type: {callType}</p>
    </div>
  );
};

export default VoiceCall;
