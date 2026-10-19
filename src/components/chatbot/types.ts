export interface MessageSource {
  title: string;
  url?: string;
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  isLeadCapture?: boolean;
  sources?: MessageSource[];
  isError?: boolean;
  canRetry?: boolean;
}
