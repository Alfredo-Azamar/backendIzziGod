const { config } = require("dotenv");
const {
  ConnectContactLensClient,
  ListRealtimeContactAnalysisSegmentsCommand,
} = require("@aws-sdk/client-connect-contact-lens");

config();

async function getActiveCalls() {

  const client = new ConnectContactLensClient({ region: "us-east-1" });
  const input = {
    InstanceId: "arn:aws:connect:us-east-1:905418447691:instance/cbfa02b8-09e5-4774-8576-45965720fb02",
    ContactId: "7492b2b1-e08f-40ef-90f8-438206502fd8"
    //MaxResults: 10,
    //NextToken: "string"
  }
  
  const command = new ListRealtimeContactAnalysisSegmentsCommand(input);
  try{
    const response = await client.send(command);
    for (const segment of response.Segments) {
      console.log(`${segment.Transcript.ParticipantRole}: "${segment.Transcript.Content}" -> ${segment.Transcript.Sentiment}`);
    }
  } catch (error) {
    console.error("Error getting transcript:", error);
  }
}

getActiveCalls();