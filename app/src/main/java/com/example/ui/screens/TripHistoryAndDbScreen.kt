package com.example.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudSync
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.RideEntity
import com.example.data.RideFlowRepository
import com.example.data.SupabaseSyncState
import com.example.data.TripStatus
import com.example.ui.theme.CoralAlert
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.EmeraldOnline
import com.example.ui.theme.GlacierWhite
import com.example.ui.theme.NeonAmber
import com.example.ui.theme.ObsidianBackground
import com.example.ui.theme.SlateCard
import com.example.ui.theme.SlateSurface
import com.example.ui.theme.SteelGray
import com.example.ui.theme.SubtleBorder
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun TripHistoryAndDbScreen(
    rides: List<RideEntity>,
    supabaseSyncState: SupabaseSyncState,
    onSyncNow: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var copiedSql by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("history_and_db_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // 1. Supabase Backend & Local Room Database Status Console
        item(key = "supabase_status_card") {
            Card(
                colors = CardDefaults.cardColors(containerColor = SlateSurface),
                shape = RoundedCornerShape(22.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, SubtleBorder, RoundedCornerShape(22.dp))
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (supabaseSyncState is SupabaseSyncState.Connected) {
                                    Icons.Default.CloudDone
                                } else {
                                    Icons.Default.Storage
                                },
                                contentDescription = null,
                                tint = if (supabaseSyncState is SupabaseSyncState.Connected) EmeraldOnline else ElectricCyan,
                                modifier = Modifier.size(26.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "Supabase & Room Persistence Engine",
                                    style = MaterialTheme.typography.titleLarge,
                                    color = GlacierWhite,
                                    fontWeight = FontWeight.Bold
                                )
                                val subText = when (supabaseSyncState) {
                                    is SupabaseSyncState.Connected ->
                                        "Connected to ${supabaseSyncState.projectHost} • Synced at ${supabaseSyncState.lastSyncTime}"
                                    is SupabaseSyncState.LocalFallback ->
                                        "Offline-Ready Room SQLite Active (${supabaseSyncState.localVehicles} Vehicles, ${rides.size} Trips)"
                                    is SupabaseSyncState.Syncing ->
                                        "Synchronizing tables with Supabase PostgREST..."
                                    is SupabaseSyncState.Error ->
                                        supabaseSyncState.message
                                }
                                Text(
                                    text = subText,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = SteelGray
                                )
                            }
                        }
                    }

                    if (supabaseSyncState is SupabaseSyncState.LocalFallback) {
                        Text(
                            text = supabaseSyncState.reason,
                            style = MaterialTheme.typography.bodyMedium,
                            color = NeonAmber
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = onSyncNow,
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp)
                                .testTag("sync_supabase_button"),
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = ElectricCyan,
                                contentColor = ObsidianBackground
                            )
                        ) {
                            Icon(imageVector = Icons.Default.CloudSync, contentDescription = null)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Sync Supabase Now", fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = {
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
                                clipboard?.setPrimaryClip(
                                    ClipData.newPlainText("Supabase SQL Schema", RideFlowRepository.SUPABASE_SQL_SCHEMA)
                                )
                                copiedSql = true
                            },
                            modifier = Modifier
                                .height(48.dp)
                                .testTag("copy_sql_schema_button"),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ContentCopy,
                                contentDescription = null,
                                tint = NeonAmber,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (copiedSql) "SQL Copied!" else "Copy SQL Schema",
                                color = NeonAmber,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    // Expandable / Visible SQL Preview snippet
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(ObsidianBackground)
                            .padding(12.dp)
                    ) {
                        Text(
                            text = "SUPABASE REST ENDPOINTS: /rest/v1/vehicles & /rest/v1/rides",
                            style = MaterialTheme.typography.labelMedium,
                            color = EmeraldOnline
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Configure SUPABASE_URL and SUPABASE_ANON_KEY in the AI Studio Secrets panel. All bookings and status updates automatically persist locally and sync to your Supabase project.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = SteelGray
                        )
                    }
                }
            }
        }

        // 2. Trip History & Receipts Header
        item(key = "trip_history_header") {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(top = 4.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.History,
                    contentDescription = null,
                    tint = ElectricCyan,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Trip Logs & Ride Receipts (${rides.size})",
                    style = MaterialTheme.typography.titleLarge,
                    color = GlacierWhite,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        items(items = rides, key = { it.id }) { ride ->
            RideHistoryReceiptCard(ride = ride)
        }
    }
}

@Composable
private fun RideHistoryReceiptCard(ride: RideEntity) {
    val timeFormatter = remember { SimpleDateFormat("MMM d, HH:mm", Locale.US) }
    val statusColor = when (ride.tripStatus) {
        TripStatus.COMPLETED -> EmeraldOnline
        TripStatus.CANCELLED -> CoralAlert
        else -> ElectricCyan
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = SlateSurface),
        shape = RoundedCornerShape(18.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, SubtleBorder, RoundedCornerShape(18.dp))
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = ride.vehicleName,
                        style = MaterialTheme.typography.titleMedium,
                        color = GlacierWhite,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${timeFormatter.format(Date(ride.createdAt))} • Driver: ${ride.driverName} (${ride.licensePlate})",
                        style = MaterialTheme.typography.bodyMedium,
                        color = SteelGray
                    )
                }

                Surface(
                    color = statusColor.copy(alpha = 0.16f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = ride.tripStatus.name,
                        style = MaterialTheme.typography.labelMedium,
                        color = statusColor,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            HorizontalDivider(color = SubtleBorder.copy(alpha = 0.5f))

            Text(
                text = "From: ${ride.pickupName} → To: ${ride.dropoffName}",
                style = MaterialTheme.typography.bodyMedium,
                color = GlacierWhite
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "${ride.distanceKm} km • ${ride.durationMinutes} min • ${ride.paymentMethod}",
                        style = MaterialTheme.typography.labelMedium,
                        color = SteelGray
                    )
                    if (ride.userRating > 0) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = NeonAmber,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = "${ride.userRating}/5",
                            style = MaterialTheme.typography.labelMedium,
                            color = NeonAmber
                        )
                    }
                }

                Text(
                    text = "$${String.format(Locale.US, "%.2f", ride.totalFare)}",
                    style = MaterialTheme.typography.titleLarge,
                    color = EmeraldOnline,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
