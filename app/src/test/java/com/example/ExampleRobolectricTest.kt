package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.SeedCatalog
import com.example.data.VehicleCategory
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

    @Test
    fun `read string from context`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val appName = context.getString(R.string.app_name)
        assertEquals("RideFlow", appName)
    }

    @Test
    fun `seed catalog contains vehicles across categories`() {
        val vehicles = SeedCatalog.initialVehicles
        assertTrue(vehicles.size >= 8)
        assertTrue(vehicles.any { it.category == VehicleCategory.ELECTRIC.name })
        assertTrue(vehicles.any { it.category == VehicleCategory.SUV.name })
        assertTrue(vehicles.any { it.category == VehicleCategory.SEDAN.name })
        assertTrue(vehicles.any { it.category == VehicleCategory.LUXURY.name })
    }
}
