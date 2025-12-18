
const axios = require("axios");

async function reindexTickets() {
  try {
    console.log("=== 获取所有工单数据 ===");
    const ticketsResponse = await axios.get("http://localhost:3005/tickets");
    const tickets = ticketsResponse.data;
    console.log(`获取到 ${tickets.length} 个工单`);

    console.log("=== 重新索引所有工单 ===");
    for (const ticket of tickets) {
      console.log(`正在索引工单: ${ticket.id}`);
      try {
        await axios.put(`http://localhost:9201/tickets/_doc/${ticket.id}`, ticket, {
          headers: { "Content-Type": "application/json" }
        });
        console.log(`工单 ${ticket.id} 索引成功`);
      } catch (error) {
        console.error(`工单 ${ticket.id} 索引失败:`, error.message);
      }
    }

    console.log("=== 所有工单索引完成 ===");
  } catch (error) {
    console.error("重新索引过程中发生错误:", error.message);
  }
}

reindexTickets();

