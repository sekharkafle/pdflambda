const parser = require('lambda-multipart-parser')  
const pdf = require('pdf-parse')
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
exports.handler = async function(event, context) {
  const result = await parser.parse(event);
  let resText = '';
  if(result.files?.length){
    const d = await pdf(result.files[0].content);
    let txt = d.text;
    var prompt = `Human:You are an expert assistant with expertise in summarizing and pulling out important sections of a text. The following text is from a PDF document. Follow these steps: read the text, summarize the text, and identify the main ideas. In your response include the summary and bullet points for the main ideas. Do not respond with more than 5 sentences.\n<TEXT>${txt}</TEXT>\n\nAssistant:`;
    const client = new BedrockRuntimeClient({
        serviceId: 'bedrock',
        region: 'us-east-1',
        });
    const input = {
        modelId: 'anthropic.claude-v2',
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
        prompt: prompt,
        max_tokens_to_sample: 2000,
        temperature: 0.5,
        top_k: 250,
        top_p: 1,
        stop_sequences: ['\n\nHuman:'],
        anthropic_version: 'bedrock-2023-05-31'
        }),
    };
const command = new InvokeModelCommand(input);
const response = await client.send(command);

    // The response is a Uint8Array of a stringified JSON blob
    // so you need to first decode the Uint8Array to a string
    // then parse the string.
    let res2 = new TextDecoder().decode(response.body);
    return JSON.parse(res2);   
      //resText = await sendAIRequest( prompt);
  }
  return 'error';
}